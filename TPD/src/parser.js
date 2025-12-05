/**
 * Dil - Türkçe Programlama Dili
 * Parser - Token'ları AST'ye (Abstract Syntax Tree) dönüştürür
 */

import { TokenType } from './lexer.js';

// AST Node Types
export const NodeType = {
  PROGRAM: 'Program',
  SAYI_LITERAL: 'SayiLiteral',
  YAZI_LITERAL: 'YaziLiteral',
  BOOLEAN_LITERAL: 'BooleanLiteral',
  BOS_LITERAL: 'BosLiteral',
  TANIMLAYICI: 'Tanimlayici',
  IKILI_IFADE: 'IkiliIfade',
  TEKLI_IFADE: 'TekliIfade',
  ATAMA: 'Atama',
  DEGISKEN_BILDIRIMI: 'DegiskenBildirimi',
  FONKSIYON_BILDIRIMI: 'FonksiyonBildirimi',
  FONKSIYON_CAGRISI: 'FonksiyonCagrisi',
  SINIF_BILDIRIMI: 'SinifBildirimi',
  EGER_IFADESI: 'EgerIfadesi',
  DONGU_IFADESI: 'DonguIfadesi',
  HER_DONGUSU: 'HerDongusu',
  IKEN_DONGUSU: 'IkenDongusu',
  DONDUR_IFADESI: 'DondurIfadesi',
  BLOK: 'Blok',
  DIZI_LITERAL: 'DiziLiteral',
  NESNE_LITERAL: 'NesneLiteral',
  ERISIM: 'Erisim',
  INDEKS_ERISIM: 'IndeksErisim',
  KUTUPHANE_IMPORT: 'KutuphaneImport',
  ASENKRON_FONKSIYON: 'AsenkronFonksiyon',
  BEKLE_IFADESI: 'BekleIfadesi',
  DENE_YAKALA: 'DeneYakala',
  ESLESTIR_IFADESI: 'EslestirIfadesi',
  KIR_IFADESI: 'KirIfadesi',
  DEVAM_IFADESI: 'DevamIfadesi',
  YENI_IFADESI: 'YeniIfadesi',
  DISA_AKTARMA: 'DisaAktarma',
  DEBUGGER: 'Debugger',
  MAKRO_BILDIRIMI: 'MakroBildirimi',
};


export class Parser {
  constructor(tokens) {
    this.tokens = tokens.filter(t => t.type !== TokenType.YENI_SATIR);
    this.position = 0;
  }
  
  get currentToken() {
    return this.tokens[this.position];
  }
  
  peek(offset = 1) {
    return this.tokens[this.position + offset];
  }
  
  advance() {
    this.position++;
    return this.tokens[this.position - 1];
  }
  
  expect(type) {
    if (this.currentToken.type !== type) {
      throw new Error(
        `Beklenen: ${type}, Bulunan: ${this.currentToken.type} ` +
        `(${this.currentToken.line}:${this.currentToken.column})`
      );
    }
    return this.advance();
  }
  
  parse() {
    const program = {
      type: NodeType.PROGRAM,
      body: []
    };
    
    while (this.currentToken.type !== TokenType.EOF) {
      program.body.push(this.parseStatement());
    }
    
    return program;
  }
  
  parseStatement() {
    switch (this.currentToken.type) {
      case TokenType.KUTUPHANE:
      case TokenType.ICE_AKTAR:
        return this.parseImport();
      case TokenType.DISA_AKTAR:
        return this.parseExport();
      case TokenType.FONKSIYON:
        return this.parseFunctionDeclaration();
      case TokenType.ASENKRON:
        return this.parseAsyncFunction();
      case TokenType.SINIF:
        return this.parseClassDeclaration();
      case TokenType.EGER:
        return this.parseIfStatement();
      case TokenType.ESLES:
        return this.parseSwitch();
      case TokenType.DEBUGGER:
        this.advance();
        return { type: NodeType.DEBUGGER };
      case TokenType.MAKRO:
        return this.parseMacroDeclaration();
      case TokenType.SUSLU_AC:
        return this.parseBlock();
      case TokenType.DONGU:
        return this.parseForLoop();
      case TokenType.HER:
        return this.parseForEachLoop();
      case TokenType.IKEN:
        return this.parseWhileLoop();
      case TokenType.DONDUR:
        return this.parseReturnStatement();
      case TokenType.KIR:
        this.advance();
        return { type: NodeType.KIR_IFADESI };
      case TokenType.DEVAM:
        this.advance();
        return { type: NodeType.DEVAM_IFADESI };
      case TokenType.DENE:
        return this.parseTryCatch();
      case TokenType.ESLESTIR:
        return this.parseMatch();
      case TokenType.TANIMLAYICI:
        if (this.peek()?.type === TokenType.ATAMA || 
            this.peek()?.type === TokenType.IKI_NOKTA) {
          return this.parseVariableDeclaration();
        }
        return this.parseExpression();
      case TokenType.BU:
        // Handle this.property = value
        return this.parseExpression();
      default:
        return this.parseExpression();
    }
  }
  
  parseImport() {
    if (this.currentToken.type === TokenType.KUTUPHANE) {
      this.advance(); // consume kütüphane
      const name = this.expect(TokenType.TANIMLAYICI).value;
      this.expect(TokenType.FROM); // from (veya den)
      const source = this.expect(TokenType.YAZI).value;
      
      return {
        type: NodeType.KUTUPHANE_IMPORT,
        name,
        source
      };
    } else {
      // içe_aktar "dosya.dil" olarak mat
      this.expect(TokenType.ICE_AKTAR);
      const source = this.expect(TokenType.YAZI).value;
      
      let name = null;
      if (this.currentToken.type === TokenType.OLARAK) {
        this.advance();
        name = this.expect(TokenType.TANIMLAYICI).value;
      } else {
        // İsim verilmezse dosya adından çıkarım yapılabilir ama şimdilik zorunlu tutalım veya null bırakalım
        throw new Error('Yerel import için "olarak" kullanılarak bir isim belirtilmeli');
      }
      
      return {
        type: NodeType.KUTUPHANE_IMPORT,
        name,
        source,
        isLocal: true
      };
    }
  }

  parseExport() {
    this.expect(TokenType.DISA_AKTAR);
    const declaration = this.parseStatement();
    
    // Sadece bildirimler dışa aktarılabilir
    if (declaration.type !== NodeType.DEGISKEN_BILDIRIMI &&
        declaration.type !== NodeType.FONKSIYON_BILDIRIMI &&
        declaration.type !== NodeType.ASENKRON_FONKSIYON &&
        declaration.type !== NodeType.SINIF_BILDIRIMI) {
      throw new Error('Sadece değişken, fonksiyon ve sınıf bildirimleri dışa aktarılabilir.');
    }
    
    return {
      type: NodeType.DISA_AKTARMA,
      declaration
    };
  }
  
  parseFunctionDeclaration(isAsync = false) {
    if (!isAsync) {
      this.expect(TokenType.FONKSIYON);
    }
    
    const name = this.expect(TokenType.TANIMLAYICI).value;
    this.expect(TokenType.PARANTEZ_AC);
    
    const params = [];
    while (this.currentToken.type !== TokenType.PARANTEZ_KAPA) {
      const paramName = this.expect(TokenType.TANIMLAYICI).value;
      let paramType = null;
      
      if (this.currentToken.type === TokenType.IKI_NOKTA) {
        this.advance();
        paramType = this.expect(TokenType.TANIMLAYICI).value;
      }
      
      params.push({ name: paramName, type: paramType });
      
      if (this.currentToken.type === TokenType.VIRGUL) {
        this.advance();
      }
    }
    
    this.expect(TokenType.PARANTEZ_KAPA);
    
    let returnType = null;
    if (this.currentToken.type === TokenType.OK) {
      this.advance();
      returnType = this.expect(TokenType.TANIMLAYICI).value;
    }
    
    const body = this.parseBlock();
    
    return {
      type: isAsync ? NodeType.ASENKRON_FONKSIYON : NodeType.FONKSIYON_BILDIRIMI,
      name,
      params,
      returnType,
      body
    };
  }
  
  parseAsyncFunction() {
    this.expect(TokenType.ASENKRON);
    this.expect(TokenType.FONKSIYON);
    return this.parseFunctionDeclaration(true);
  }
  
  parseClassDeclaration() {
    this.expect(TokenType.SINIF);
    const name = this.expect(TokenType.TANIMLAYICI).value;
    this.expect(TokenType.SUSLU_AC);
    
    const properties = [];
    const methods = [];
    let constructor = null;
    
    while (this.currentToken.type !== TokenType.SUSLU_KAPA) {
      if (this.currentToken.type === TokenType.KURUCU) {
        this.advance();
        // Parse constructor like a function but without a name
        this.expect(TokenType.PARANTEZ_AC);
        
        const params = [];
        while (this.currentToken.type !== TokenType.PARANTEZ_KAPA) {
          const paramName = this.expect(TokenType.TANIMLAYICI).value;
          let paramType = null;
          
          if (this.currentToken.type === TokenType.IKI_NOKTA) {
            this.advance();
            paramType = this.expect(TokenType.TANIMLAYICI).value;
          }
          
          params.push({ name: paramName, type: paramType });
          
          if (this.currentToken.type === TokenType.VIRGUL) {
            this.advance();
          }
        }
        
        this.expect(TokenType.PARANTEZ_KAPA);
        const body = this.parseBlock();
        
        constructor = {
          type: NodeType.FONKSIYON_BILDIRIMI,
          name: 'kurucu',
          params,
          returnType: null,
          body
        };
      } else if (this.currentToken.type === TokenType.FONKSIYON) {
        methods.push(this.parseFunctionDeclaration());
      } else {
        const propName = this.expect(TokenType.TANIMLAYICI).value;
        let propType = null;
        
        if (this.currentToken.type === TokenType.IKI_NOKTA) {
          this.advance();
          propType = this.expect(TokenType.TANIMLAYICI).value;
        }
        
        properties.push({ name: propName, type: propType });
      }
    }
    
    this.expect(TokenType.SUSLU_KAPA);
    
    return {
      type: NodeType.SINIF_BILDIRIMI,
      name,
      properties,
      methods,
      constructor
    };
  }
  
  parseVariableDeclaration() {
    const name = this.expect(TokenType.TANIMLAYICI).value;
    let varType = null;
    let value = null;
    
    if (this.currentToken.type === TokenType.IKI_NOKTA) {
      this.advance();
      varType = this.expect(TokenType.TANIMLAYICI).value;
      
      if (this.currentToken.type === TokenType.ATAMA_TIP) {
        this.advance();
        value = this.parseExpression();
      }
    } else if (this.currentToken.type === TokenType.ATAMA) {
      this.advance();
      value = this.parseExpression();
    }
    
    return {
      type: NodeType.DEGISKEN_BILDIRIMI,
      name,
      varType,
      value
    };
  }
  
  parseSwitch() {
    this.expect(TokenType.ESLES);
    this.expect(TokenType.PARANTEZ_AC);
    const discriminant = this.parseExpression();
    this.expect(TokenType.PARANTEZ_KAPA);
    
    this.expect(TokenType.SUSLU_AC);
    
    const cases = [];
    let defaultCase = null;
    
    while (this.currentToken.type !== TokenType.SUSLU_KAPA && this.currentToken.type !== TokenType.EOF) {
      if (this.currentToken.type === TokenType.DURUM) {
        this.advance();
        const test = this.parseExpression();
        this.expect(TokenType.IKI_NOKTA);
        
        const consequence = [];
        while (
          this.currentToken.type !== TokenType.DURUM && 
          this.currentToken.type !== TokenType.VARSAYILAN && 
          this.currentToken.type !== TokenType.SUSLU_KAPA
        ) {
           consequence.push(this.parseStatement());
        }
        
        cases.push({ test, consequence: { type: NodeType.BLOK, body: consequence } });
      } else if (this.currentToken.type === TokenType.VARSAYILAN) {
        this.advance();
        this.expect(TokenType.IKI_NOKTA);
        
        const consequence = [];
        while (
          this.currentToken.type !== TokenType.DURUM && 
          this.currentToken.type !== TokenType.VARSAYILAN && 
          this.currentToken.type !== TokenType.SUSLU_KAPA
        ) {
           consequence.push(this.parseStatement());
        }
        
        defaultCase = { type: NodeType.BLOK, body: consequence };
      } else {
        throw new Error('Beklenen: durum veya varsayilan');
      }
    }
    
    this.expect(TokenType.SUSLU_KAPA);
    
    return {
      type: NodeType.ESLESTIR_IFADESI,
      discriminant,
      cases,
      defaultCase
    };
  }
  
  parseMacroDeclaration() {
    this.expect(TokenType.MAKRO);
    const name = this.expect(TokenType.TANIMLAYICI).value;
    
    this.expect(TokenType.PARANTEZ_AC);
    const params = [];
    if (this.currentToken.type !== TokenType.PARANTEZ_KAPA) {
      do {
        params.push(this.expect(TokenType.TANIMLAYICI).value);
      } while (this.currentToken.type === TokenType.VIRGUL && this.advance());
    }
    this.expect(TokenType.PARANTEZ_KAPA);
    
    this.expect(TokenType.SUSLU_AC);
    const body = [];
    while (this.currentToken.type !== TokenType.SUSLU_KAPA) {
        body.push(this.parseStatement());
    }
    this.expect(TokenType.SUSLU_KAPA);
    
    return {
      type: NodeType.MAKRO_BILDIRIMI,
      name,
      params,
      body: { type: NodeType.BLOK, body }
    };
  }

  parseIfStatement() {
    this.expect(TokenType.EGER);
    const condition = this.parseExpression();
    const thenBlock = this.parseBlock();
    
    const elseIfs = [];
    let elseBlock = null;
    
    while (this.currentToken.type === TokenType.YOKSA) {
      this.advance();
      
      if (this.currentToken.type === TokenType.EGER) {
        this.advance();
        const elseIfCondition = this.parseExpression();
        const elseIfBlock = this.parseBlock();
        elseIfs.push({ condition: elseIfCondition, body: elseIfBlock });
      } else {
        elseBlock = this.parseBlock();
        break;
      }
    }
    
    return {
      type: NodeType.EGER_IFADESI,
      condition,
      thenBlock,
      elseIfs,
      elseBlock
    };
  }
  
  parseForLoop() {
    this.expect(TokenType.DONGU);
    
    const init = this.parseStatement();
    this.expect(TokenType.NOKTA_VIRGUL);
    
    const condition = this.parseExpression();
    this.expect(TokenType.NOKTA_VIRGUL);
    
    const update = this.parseExpression();
    
    const body = this.parseBlock();
    
    return {
      type: NodeType.DONGU_IFADESI,
      init,
      condition,
      update,
      body
    };
  }
  
  parseForEachLoop() {
    this.expect(TokenType.HER);
    const variable = this.expect(TokenType.TANIMLAYICI).value;
    this.expect(TokenType.ICIN);
    const iterable = this.parseExpression();
    const body = this.parseBlock();
    
    return {
      type: NodeType.HER_DONGUSU,
      variable,
      iterable,
      body
    };
  }
  
  parseWhileLoop() {
    this.expect(TokenType.IKEN);
    const condition = this.parseExpression();
    const body = this.parseBlock();
    
    return {
      type: NodeType.IKEN_DONGUSU,
      condition,
      body
    };
  }
  
  parseReturnStatement() {
    this.expect(TokenType.DONDUR);
    const value = this.currentToken.type !== TokenType.SUSLU_KAPA && 
                  this.currentToken.type !== TokenType.EOF
      ? this.parseExpression()
      : null;
    
    return {
      type: NodeType.DONDUR_IFADESI,
      value
    };
  }
  
  parseTryCatch() {
    this.expect(TokenType.DENE);
    const tryBlock = this.parseBlock();
    
    this.expect(TokenType.YAKALA);
    const errorVar = this.expect(TokenType.TANIMLAYICI).value;
    const catchBlock = this.parseBlock();
    
    return {
      type: NodeType.DENE_YAKALA,
      tryBlock,
      errorVar,
      catchBlock
    };
  }
  
  parseMatch() {
    this.expect(TokenType.ESLESTIR);
    const value = this.parseExpression();
    this.expect(TokenType.SUSLU_AC);
    
    const cases = [];
    
    while (this.currentToken.type !== TokenType.SUSLU_KAPA) {
      const pattern = this.parseExpression();
      this.expect(TokenType.OK);
      const body = this.parseExpression();
      cases.push({ pattern, body });
    }
    
    this.expect(TokenType.SUSLU_KAPA);
    
    return {
      type: NodeType.ESLESTIR_IFADESI,
      value,
      cases
    };
  }
  
  parseBlock() {
    this.expect(TokenType.SUSLU_AC);
    const statements = [];
    
    while (this.currentToken.type !== TokenType.SUSLU_KAPA) {
      statements.push(this.parseStatement());
    }
    
    this.expect(TokenType.SUSLU_KAPA);
    
    return {
      type: NodeType.BLOK,
      statements
    };
  }
  
  parseExpression() {
    return this.parseAssignment();
  }
  
  parseAssignment() {
    const expr = this.parseLogicalOr();
    
    // Check if this is an assignment
    if (this.currentToken && this.currentToken.type === TokenType.ATAMA_TIP) {
      if (expr.type !== NodeType.TANIMLAYICI && 
          expr.type !== NodeType.ERISIM && 
          expr.type !== NodeType.INDEKS_ERISIM) {
        throw new Error('Geçersiz atama hedefi');
      }
      
      this.advance(); // consume =
      const value = this.parseExpression();
      
      return {
        type: NodeType.ATAMA,
        target: expr,
        value
      };
    }
    
    return expr;
  }
  
  parseLogicalOr() {
    let left = this.parseLogicalAnd();
    
    while (this.currentToken.type === TokenType.VEYA) {
      const operator = this.advance().type;
      const right = this.parseLogicalAnd();
      left = {
        type: NodeType.IKILI_IFADE,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  parseLogicalAnd() {
    let left = this.parseEquality();
    
    while (this.currentToken.type === TokenType.VE) {
      const operator = this.advance().type;
      const right = this.parseEquality();
      left = {
        type: NodeType.IKILI_IFADE,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  parseEquality() {
    let left = this.parseComparison();
    
    while ([TokenType.ESITTIR, TokenType.ESIT_DEGIL].includes(this.currentToken.type)) {
      const operator = this.advance().type;
      const right = this.parseComparison();
      left = {
        type: NodeType.IKILI_IFADE,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  parseComparison() {
    let left = this.parseAdditive();
    
    while ([TokenType.BUYUK, TokenType.KUCUK, TokenType.BUYUK_ESIT, TokenType.KUCUK_ESIT]
           .includes(this.currentToken.type)) {
      const operator = this.advance().type;
      const right = this.parseAdditive();
      left = {
        type: NodeType.IKILI_IFADE,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  parseAdditive() {
    let left = this.parseMultiplicative();
    
    while ([TokenType.ARTI, TokenType.EKSI].includes(this.currentToken.type)) {
      const operator = this.advance().type;
      const right = this.parseMultiplicative();
      left = {
        type: NodeType.IKILI_IFADE,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  parseMultiplicative() {
    let left = this.parseUnary();
    
    while ([TokenType.CARPI, TokenType.BOLU, TokenType.MOD].includes(this.currentToken.type)) {
      const operator = this.advance().type;
      const right = this.parseUnary();
      left = {
        type: NodeType.IKILI_IFADE,
        operator,
        left,
        right
      };
    }
    
    return left;
  }
  
  parseUnary() {
    if ([TokenType.EKSI, TokenType.DEGIL, TokenType.BEKLE].includes(this.currentToken.type)) {
      const operator = this.advance().type;
      const operand = this.parseUnary();
      
      if (operator === TokenType.BEKLE) {
        return {
          type: NodeType.BEKLE_IFADESI,
          expression: operand
        };
      }
      
      return {
        type: NodeType.TEKLI_IFADE,
        operator,
        operand
      };
    }
    
    return this.parsePostfix();
  }
  
  parsePostfix() {
    let expr = this.parsePrimary();
    
    while (true) {
      if (this.currentToken.type === TokenType.PARANTEZ_AC) {
        // Function call
        this.advance();
        const args = [];
        
        while (this.currentToken.type !== TokenType.PARANTEZ_KAPA) {
          args.push(this.parseExpression());
          if (this.currentToken.type === TokenType.VIRGUL) {
            this.advance();
          }
        }
        
        this.expect(TokenType.PARANTEZ_KAPA);
        
        expr = {
          type: NodeType.FONKSIYON_CAGRISI,
          callee: expr,
          arguments: args
        };
      } else if (this.currentToken.type === TokenType.NOKTA) {
        // Member access
        this.advance();
        
        let property;
        // Allow keywords as property names (e.g. dosya.yaz)
        if (this.currentToken.value && /^[a-zA-ZğüşıöçĞÜŞİÖÇ_]/.test(this.currentToken.value)) {
          property = this.currentToken.value;
          this.advance();
        } else {
          property = this.expect(TokenType.TANIMLAYICI).value;
        }
        
        expr = {
          type: NodeType.ERISIM,
          object: expr,
          property
        };
      } else if (this.currentToken.type === TokenType.KOSELI_AC) {
        // Index access
        this.advance();
        const index = this.parseExpression();
        this.expect(TokenType.KOSELI_KAPA);
        
        expr = {
          type: NodeType.INDEKS_ERISIM,
          object: expr,
          index
        };
      } else if ([TokenType.ARTIR, TokenType.AZALT].includes(this.currentToken.type)) {
        const operator = this.advance().type;
        expr = {
          type: NodeType.TEKLI_IFADE,
          operator,
          operand: expr,
          postfix: true
        };
      } else {
        break;
      }
    }
    
    return expr;
  }
  
  parsePrimary() {
    switch (this.currentToken.type) {
      case TokenType.SAYI:
        return {
          type: NodeType.SAYI_LITERAL,
          value: this.advance().value
        };
        
      case TokenType.YAZI:
        return {
          type: NodeType.YAZI_LITERAL,
          value: this.advance().value
        };
        
      case TokenType.DOGRU:
        this.advance();
        return {
          type: NodeType.BOOLEAN_LITERAL,
          value: true
        };
        
      case TokenType.YANLIS:
        this.advance();
        return {
          type: NodeType.BOOLEAN_LITERAL,
          value: false
        };
        
      case TokenType.BOS:
        this.advance();
        return {
          type: NodeType.BOS_LITERAL,
          value: null
        };
        
      case TokenType.BU:
        this.advance();
        return {
          type: NodeType.TANIMLAYICI,
          name: 'bu'
        };
        
      case TokenType.TANIMLAYICI:
        return {
          type: NodeType.TANIMLAYICI,
          name: this.advance().value
        };
        
      case TokenType.YENI:
        this.advance();
        const className = this.expect(TokenType.TANIMLAYICI).value;
        this.expect(TokenType.PARANTEZ_AC);
        
        const args = [];
        while (this.currentToken.type !== TokenType.PARANTEZ_KAPA) {
          args.push(this.parseExpression());
          if (this.currentToken.type === TokenType.VIRGUL) {
            this.advance();
          }
        }
        
        this.expect(TokenType.PARANTEZ_KAPA);
        
        return {
          type: NodeType.YENI_IFADESI,
          className,
          arguments: args
        };
        
      case TokenType.KOSELI_AC:
        return this.parseArrayLiteral();
        
      case TokenType.SUSLU_AC:
        return this.parseObjectLiteral();
        
      case TokenType.PARANTEZ_AC:
        this.advance();
        const expr = this.parseExpression();
        this.expect(TokenType.PARANTEZ_KAPA);
        return expr;
        
      case TokenType.YAZ:
        this.advance();
        this.expect(TokenType.PARANTEZ_AC);
        const yazArgs = [];
        
        while (this.currentToken.type !== TokenType.PARANTEZ_KAPA) {
          yazArgs.push(this.parseExpression());
          if (this.currentToken.type === TokenType.VIRGUL) {
            this.advance();
          }
        }
        
        this.expect(TokenType.PARANTEZ_KAPA);
        
        return {
          type: NodeType.FONKSIYON_CAGRISI,
          callee: { type: NodeType.TANIMLAYICI, name: 'yaz' },
          arguments: yazArgs
        };
        
      default:
        throw new Error(
          `Beklenmeyen token: ${this.currentToken.type} ` +
          `(${this.currentToken.line}:${this.currentToken.column})`
        );
    }
  }
  
  parseArrayLiteral() {
    this.expect(TokenType.KOSELI_AC);
    const elements = [];
    
    while (this.currentToken.type !== TokenType.KOSELI_KAPA) {
      elements.push(this.parseExpression());
      if (this.currentToken.type === TokenType.VIRGUL) {
        this.advance();
      }
    }
    
    this.expect(TokenType.KOSELI_KAPA);
    
    return {
      type: NodeType.DIZI_LITERAL,
      elements
    };
  }
  
  parseObjectLiteral() {
    this.expect(TokenType.SUSLU_AC);
    const properties = [];
    
    while (this.currentToken.type !== TokenType.SUSLU_KAPA) {
      let key;
      
      if (this.currentToken.type === TokenType.YAZI) {
        key = this.advance().value;
      } else if (this.currentToken.value && /^[a-zA-ZğüşıöçĞÜŞİÖÇ_]/.test(this.currentToken.value)) {
        // Identifier or Keyword
        key = this.currentToken.value;
        this.advance();
      } else {
        key = this.expect(TokenType.TANIMLAYICI).value;
      }
      
      this.expect(TokenType.IKI_NOKTA);
      const value = this.parseExpression();
      
      properties.push({ key, value });
      
      if (this.currentToken.type === TokenType.VIRGUL) {
        this.advance();
      }
    }
    
    this.expect(TokenType.SUSLU_KAPA);
    
    return {
      type: NodeType.NESNE_LITERAL,
      properties
    };
  }
}

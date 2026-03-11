export class Document {
  static validateCPF(cpf: string): boolean {
    if (!cpf || typeof cpf !== 'string') return false;

    const cleanCpf = cpf.replace(/\D/g, '').trim();

    if (cleanCpf.length !== 11 || /^(\d)\1+$/.test(cleanCpf)) return false;

    const calcCheckDigit = (base: number) => {
      let sum = 0;
      for (let i = 0; i < base; i++) {
        sum += parseInt(cleanCpf.charAt(i), 10) * (base + 1 - i);
      }
      const rest = (sum * 10) % 11;
      return rest === 10 ? 0 : rest;
    };

    return (
      calcCheckDigit(9) === parseInt(cleanCpf.charAt(9), 10) &&
      calcCheckDigit(10) === parseInt(cleanCpf.charAt(10), 10)
    );
  }

  static validateCNPJ(cnpj: string): boolean {
    if (!cnpj || typeof cnpj !== 'string') return false;

    const cleanCnpj = cnpj.replace(/\D/g, '').trim();

    if (cleanCnpj.length !== 14 || /^(\d)\1+$/.test(cleanCnpj)) return false;

    const calcCheckDigit = (length: number) => {
      let sum = 0;
      let pos = length - 7;
      for (let i = length; i >= 1; i--) {
        sum += parseInt(cleanCnpj.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      const rest = sum % 11;
      return rest < 2 ? 0 : 11 - rest;
    };

    return (
      calcCheckDigit(12) === parseInt(cleanCnpj.charAt(12)) &&
      calcCheckDigit(13) === parseInt(cleanCnpj.charAt(13))
    );
  }

  static formatCPF(cpf: string): string {
    if (!cpf) return '';
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return cpf;
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  static formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return cnpj;
    return cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  static cleanDocument(document: string): string {
    if (!document) return '';
    return document.replace(/\D/g, '');
  }

  static validateDocument(document: string): boolean {
    if (this.validateCPF(document)) return true;
    if (this.validateCNPJ(document)) return true;
    return false;
  }

  static maskDocument(document: string): string {
    if (!document) return '';
    const clean = document.replace(/\D/g, '');
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return clean;
  }
}
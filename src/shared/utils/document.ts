export class Document {
  private static readonly CNPJ_WEIGHTS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  private static readonly CNPJ_WEIGHTS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  private static normalizeAlphanumeric(value: string): string {
    if (!value || typeof value !== "string") return "";
    return value.toUpperCase().replace(/[^A-Z0-9]/g, "").trim();
  }

  private static toAlphanumericValue(char: string): number {
    const code = char.charCodeAt(0);
    if (code >= 48 && code <= 57) return code - 48;
    if (code >= 65 && code <= 90) return code - 55;
    return -1;
  }

  private static calcCnpjCheckDigit(base: string, weights: number[]): number {
    const sum = base
      .split("")
      .reduce((acc, char, index) => acc + this.toAlphanumericValue(char) * weights[index], 0);
    const mod = sum % 11;
    const digit = 11 - mod;
    return digit >= 10 ? 0 : digit;
  }

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

  static validateCNPJAlphanumeric(cnpj: string): boolean {
    const cleanCnpj = this.normalizeAlphanumeric(cnpj);

    if (cleanCnpj.length !== 14) return false;
    if (!/^[A-Z0-9]{14}$/.test(cleanCnpj)) return false;
    if (/^([A-Z0-9])\1+$/.test(cleanCnpj)) return false;
    if (!/^\d{2}$/.test(cleanCnpj.slice(12))) return false;

    const base12 = cleanCnpj.slice(0, 12);
    const checkDigits = cleanCnpj.slice(12);

    const firstDigit = this.calcCnpjCheckDigit(base12, this.CNPJ_WEIGHTS_1);
    const secondDigit = this.calcCnpjCheckDigit(`${base12}${firstDigit}`, this.CNPJ_WEIGHTS_2);

    return checkDigits === `${firstDigit}${secondDigit}`;
  }

  static formatCPF(cpf: string): string {
    if (!cpf) return '';
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) return cpf;
    return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  static formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    const cleanCnpj = this.normalizeAlphanumeric(cnpj);
    if (cleanCnpj.length !== 14) return cnpj;
    return cleanCnpj.replace(/(.{2})(.{3})(.{3})(.{4})(.{2})/, '$1.$2.$3/$4-$5');
  }

  static cleanDocument(document: string): string {
    if (!document) return '';
    return document.replace(/\D/g, '');
  }

  static validateDocument(document: string): boolean {
    if (this.validateCPF(document)) return true;
    if (this.validateCNPJ(document)) return true;
    if (this.validateCNPJAlphanumeric(document)) return true;
    return false;
  }

  static maskDocument(document: string): string {
    if (!document) return '';
    const clean = this.normalizeAlphanumeric(document);
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (clean.length === 14) {
      return clean.replace(/(.{2})(.{3})(.{3})(.{4})(.{2})/, '$1.$2.$3/$4-$5');
    }
    return clean;
  }
}
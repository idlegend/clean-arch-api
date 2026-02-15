export class User {
    constructor(
      public readonly id: string,
      public name: string,
      public email: string,
      public password: string,
      public readonly createdAt: Date
    ) {}
  
    validateEmail() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        throw new Error("Invalid email format");
      }
    }
  }
  
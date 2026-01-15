export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function isLegalAge(birthDate: Date): boolean {
  return calculateAge(birthDate) >= 18;
}

export function validateBirthDate(birthDate: string): { valid: boolean; error?: string } {
  const date = new Date(birthDate);
  const today = new Date();
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: "Data de nascimento inválida" };
  }
  
  if (date > today) {
    return { valid: false, error: "Data de nascimento não pode ser no futuro" };
  }
  
  const age = calculateAge(date);
  
  if (age > 120) {
    return { valid: false, error: "Data de nascimento inválida" };
  }
  
  if (age < 18) {
    return { valid: false, error: "Você precisa ter 18 anos ou mais para usar o NeuroExecução" };
  }
  
  return { valid: true };
}

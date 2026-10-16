export function podePublicar(user) {
  return Boolean(user?.emailVerified && user.email &&
    !user.email.trim().toLowerCase().endsWith('@discente.ifpe.edu.br'));
}

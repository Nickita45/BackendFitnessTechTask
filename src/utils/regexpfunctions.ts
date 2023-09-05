function isValidEmail(email:string) {
    // Регулярное выражение для проверки адреса электронной почты
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Проверяем строку с помощью регулярного выражения
    return emailRegex.test(email);
}

export {isValidEmail};
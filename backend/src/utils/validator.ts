/**
 * 验证身份证号码
 * 仅验证格式，不验证校验位（便于测试和用户输入）
 */
export function validateIdCard(idCard: string): boolean {
  if (!idCard || idCard.length !== 18) {
    return false;
  }

  // 格式验证：地区码(6位) + 出生日期(8位) + 顺序码(3位) + 校验码(1位)
  const pattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
  return pattern.test(idCard);
}

/**
 * 验证手机号
 */
export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Cấu hình thanh toán
 * File này chứa các hằng số liên quan đến thanh toán và ví
 */

/**
 * Các mức nạp tiền nhanh (VND)
 * Có thể tùy chỉnh các mức theo yêu cầu
 */
export const QUICK_TOP_UP_AMOUNTS = [
  50000,    // 50.000 đ
  100000,   // 100.000 đ
  200000,   // 200.000 đ
  500000,   // 500.000 đ
  1000000,  // 1.000.000 đ
  2000000,  // 2.000.000 đ
];

/**
 * Số tiền nạp tối thiểu (VND)
 */
export const MIN_TOP_UP_AMOUNT = 10000; // 10.000 đ

/**
 * Số tiền nạp tối đa (VND)
 * Có thể thêm nếu cần giới hạn
 */
export const MAX_TOP_UP_AMOUNT = 50000000; // 50.000.000 đ


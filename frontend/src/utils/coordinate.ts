// src/utils/coordinate.ts
/**
 * 坐标工具类：专门处理手势相关的坐标转换（核心：镜面翻转）
 * 全程手势统一使用这里的函数，确保坐标一致性
 */

/**
 * 单个坐标点的镜面翻转（基础核心函数）
 * @param point 原始坐标点 { x: number; y: number }
 * @param fixed 保留小数位数（默认2位，方便查看和计算）
 * @returns 镜面翻转后的坐标点
 */
export const mirrorSinglePoint = (
  point: { x: number; y: number },
  fixed: number = 2
): { x: string; y: string } => {
  // 镜面翻转核心逻辑：x轴取反（1 - 原始x），y轴保持不变（摄像头y轴无需翻转）
  const mirroredX = (1 - point.x).toFixed(fixed);
  const mirroredY = point.y.toFixed(fixed);
  return { x: mirroredX, y: mirroredY };
};

/**
 * 批量关键点的镜面翻转（实用函数，适配原有关键点格式）
 * @param keyPoints 原始关键点对象（如 { 腕部: {x,y}, 拇指尖: {x,y} }）
 * @param fixed 保留小数位数（默认2位）
 * @returns 镜面翻转后的批量关键点对象
 */
export const mirrorKeyPoints = (
  keyPoints: Record<string, { x: number; y: number }>,
  fixed: number = 2
): Record<string, { x: string; y: string }> => {
  const mirroredResult: Record<string, { x: string; y: string }> = {};
  
  // 遍历所有关键点，批量执行镜面翻转
  Object.entries(keyPoints).forEach(([name, point]) => {
    mirroredResult[name] = mirrorSinglePoint(point, fixed);
  });
  
  return mirroredResult;
};

/**
 * （扩展函数）获取手势核心关键点（腕部、五指根、五指尖），用于后续统一处理
 * @param hand MediaPipe识别的手部数据
 * @param HAND_LANDMARKS 手部关键点映射（从gestureRules导入）
 * @returns 原始核心关键点对象（未镜面，可后续调用mirrorKeyPoints处理）
 */
export const getCoreKeyPoints = (
  hand: Array<{ x: number; y: number }>,
  HAND_LANDMARKS: Record<string, number>
): Record<string, { x: number; y: number }> => {
  if (!hand || !HAND_LANDMARKS) return {};
  
  return {
    "腕部(WRIST)": hand[HAND_LANDMARKS.WRIST],
    "拇指根(THUMB_MCP)": hand[HAND_LANDMARKS.THUMB_MCP],
    "食指根(INDEX_MCP)": hand[HAND_LANDMARKS.INDEX_MCP],
    "中指根(MIDDLE_MCP)": hand[HAND_LANDMARKS.MIDDLE_MCP],
    "无名指根(RING_MCP)": hand[HAND_LANDMARKS.RING_MCP],
    "小指根(PINKY_MCP)": hand[HAND_LANDMARKS.PINKY_MCP],
    "拇指尖(THUMB_TIP)": hand[HAND_LANDMARKS.THUMB_TIP],
    "食指尖(INDEX_TIP)": hand[HAND_LANDMARKS.INDEX_TIP],
    "中指尖(MIDDLE_TIP)": hand[HAND_LANDMARKS.MIDDLE_TIP],
    "无名指尖(RING_TIP)": hand[HAND_LANDMARKS.RING_TIP],
    "小指尖(PINKY_TIP)": hand[HAND_LANDMARKS.PINKY_TIP],
  };
};
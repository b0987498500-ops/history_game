/**
 * ==============================================================================
 * 臺灣歷史情境模擬 RPG - 國中臺灣史全篇章核心架構型別定義
 * (Taiwan History Curriculum RPG Engine - TypeScript Definitions)
 * ==============================================================================
 */

/**
 * 臺灣歷史長河七大時代篇章
 */
export type EraId =
  | 'era_01_prehistory'       // 篇章 1：史前與原住民族
  | 'era_02_international'    // 篇章 2：國際競爭與荷西時期
  | 'era_03_zheng_regime'     // 篇章 3：鄭氏治臺與反清復明
  | 'era_04_early_qing'       // 篇章 4：清領前期（消極治臺與移民社會）
  | 'era_05_late_qing'        // 篇章 5：清領後期（開港通商與現代化）
  | 'era_06_japanese_rule'    // 篇章 6：日治時期（殖民體制與非武裝抗爭）
  | 'era_07_postwar_modern';  // 篇章 7：戰後臺灣（戒嚴、民主化與經濟奇蹟）

/**
 * 角色所屬社會階級與陣營立場
 */
export type CharacterStance =
  | 'ruler_official'     // 官方統治階層 / 行政長官 / 省級巡撫
  | 'civilian_elite'     // 本地士紳 / 知識分子 / 開墾首領
  | 'merchant_trader'    // 貿易行商 / 洋行買辦 / 實業巨頭
  | 'indigenous_tribal'  // 原住民族頭目 / 長老領袖 / 部族貴族
  | 'rebel_leader'       // 民變領袖 / 武裝抗爭先驅
  | 'cultural_pioneer';  // 文化啟蒙先驅 / 民主憲政運動者

/**
 * 108 課綱國中臺灣史段考高頻考點架構
 */
export interface ExamPoint {
  id: string;
  topic: '政治制度' | '對外貿易' | '水利農業' | '社會文教' | '族群抗爭';
  standardTerm: string;         // 課綱必考標準術語（如：土牛界線、渡臺三禁、三年輪作）
  frequentQuestionNote: string; // 段考高頻出題陷阱、解題關鍵與史實辨析
  relatedHistoricalYear?: string;
}

/**
 * 時代情報錦囊（防盲猜機制）
 */
export interface ClueItem {
  id: string;
  name: string;
  icon: string;
  rarity: 'SSR 關鍵政策' | 'SR 實業情報' | 'SSR 部族盟約' | 'SSR 啟蒙綱領';
  gameplayTip: string;      // 遊戲通關指引（引導玩家前往正確地標）
  historicalLore: string;   // 真實歷史脈絡（課綱微知識速記）
  howToGet: string;         // 獲取途徑（專屬小遊戲或地標探索）
}

/**
 * 39 位歷史人物角色核心定義模型
 */
export interface HistoricalCharacter {
  id: string;
  eraId: EraId;
  name: string;
  title: string;
  stance: CharacterStance;
  stanceBadge: string;
  avatar: string;
  missionGoal: string;        // 專屬長線歷史使命
  customResourceName: string; // 專屬指標名稱（如：建省洋務庫銀、祖靈gaga護佑、民智覺醒點）
  initialStats: {
    resource: number;         // 專屬資源數值
    reputation: number;       // 聲望 / 民心
    historicalInsight: number;// 史識點數（答題與情報加成）
  };
  startingClueId: string;     // 開局專屬隨身情報秘笈
  exclusiveMinigameId: string;// 專屬休閒小遊戲 ID
  minigameName: string;       // 專屬小遊戲名稱
  examPoints: ExamPoint[];    // 該角色對應之課綱必考高頻考點清單
  firstNodeId: string;        // 主線起始事件節點 ID
}

/**
 * 決策選項及史實 vs If 架空分支
 */
export interface EventOption {
  id: string;
  targetLocationId: string;   // 2.5D 大地圖對應建築地標
  actionText: string;         // 決策選項按鈕文字
  badge: string;              // 決策屬性標籤（如：👑 史實正解、⚔️ 專制重稅）
  requiredClueId?: string;    // 所需秘笈（防盲猜機制）
  isHistorical: boolean;      // 是否為史實路線
  baseCost: number;           // 消耗專屬資源
  baseReward: number;         // 獲得資源/收益
  criticalChance: number;     // 暴擊率
  criticalMultiplier: number; // 暴擊倍率
  consequence: {
    narrative: string;            // 即時敘事反饋
    historicalFactSummary: string;// 史實演進回顧（史實路線專用）
    ifButterflyEffect?: string;   // If 架空連鎖反應（架空路線專用）
  };
  examReviewNote: string;     // 該抉擇觸發的段考解析重點
  nextNodeId: string;         // 下一節點 ID
}

/**
 * 歷史事件節點模型
 */
export interface HistoryEventNode {
  id: string;
  eraId: EraId;
  characterId: string;
  title: string;
  description: string;
  historicalContext: string;   // 課綱歷史情境背景
  targetLocationId: string;
  options: EventOption[];
}

/**
 * 時代章節定義模型
 */
export interface HistoricalEraChapter {
  id: EraId;
  order: number;
  chapterTitle: string;
  periodName: string;
  timeline: string;
  themeColor: string;
  icon: string;
  syllabusHighlights: string[]; // 課綱段考大綱重點
  characterIds: string[];       // 該篇章收錄的所有歷史人物
}

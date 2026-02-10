// ============================================
// KaigoIDE 共有型定義
// ============================================

// --- 利用者 ---
export interface Client {
  id: string;
  familyName: string;
  givenName: string;
  familyNameKana: string;
  givenNameKana: string;
  birthDate: string;
  gender: 'MALE' | 'FEMALE';
  insuranceNumber: string;
  careLevel: CareLevel;
  certificationDate: string;
  address?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export type CareLevel =
  | 'SUPPORT_1'
  | 'SUPPORT_2'
  | 'CARE_1'
  | 'CARE_2'
  | 'CARE_3'
  | 'CARE_4'
  | 'CARE_5';

export const CARE_LEVEL_LABELS: Record<CareLevel, string> = {
  SUPPORT_1: '要支援1',
  SUPPORT_2: '要支援2',
  CARE_1: '要介護1',
  CARE_2: '要介護2',
  CARE_3: '要介護3',
  CARE_4: '要介護4',
  CARE_5: '要介護5',
};

// --- ケアプラン簡易管理 ---
export interface CarePlanSimple {
  id: string;
  clientId: string;
  version: number;
  createdDate: string;
  purpose: string;
  goals: CarePlanGoal[];
  createdAt: string;
  updatedAt: string;
}

export interface CarePlanGoal {
  id: string;
  carePlanId: string;
  type: GoalType;
  text: string;
  sortOrder: number;
}

export type GoalType = 'SHORT_TERM' | 'LONG_TERM';

export const GOAL_TYPE_LABELS: Record<GoalType, string> = {
  SHORT_TERM: '短期目標',
  LONG_TERM: '長期目標',
};

// --- 支援経過記録（第5表）共通 ---
export type CareRecordType = 'GENERAL' | 'MONITORING';

export const CARE_RECORD_TYPE_LABELS: Record<CareRecordType, string> = {
  GENERAL: '一般記録',
  MONITORING: 'モニタリング評価',
};

// --- 一般記録（タイプ2） ---
export interface CareRecord {
  id: string;
  clientId: string;
  recordType: 'GENERAL';
  recordDate: string;
  category: RecordCategory;
  content: string;
  relatedOrganization?: string;
  professionalJudgment?: string;
  clientFamilyOpinion?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export type RecordCategory =
  | 'VISIT'
  | 'PHONE'
  | 'FAX'
  | 'MAIL'
  | 'CONFERENCE'
  | 'OTHER';

export const RECORD_CATEGORY_LABELS: Record<RecordCategory, string> = {
  VISIT: '訪問',
  PHONE: '電話',
  FAX: 'FAX',
  MAIL: 'メール',
  CONFERENCE: '会議',
  OTHER: 'その他',
};

// --- モニタリング評価記録（タイプ1） ---
export interface MonitoringRecord {
  id: string;
  clientId: string;
  recordType: 'MONITORING';
  carePlanId: string;
  recordDate: string;
  evaluations: MonitoringEvaluation[];
  overallComment: string;
  professionalJudgment: string;
  nextAction: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringEvaluation {
  id: string;
  monitoringRecordId: string;
  goalId: string;
  goalText: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
}

export const RATING_LABELS: Record<number, string> = {
  1: '未達成',
  2: 'やや未達成',
  3: '概ね達成',
  4: '達成',
  5: '大幅に達成',
};

// --- 支援経過記録ユニオン型 ---
export type AnyRecord = CareRecord | MonitoringRecord;

// --- 入力DTO ---
export interface CreateCareRecordInput {
  clientId: string;
  recordDate: string;
  category: RecordCategory;
  content: string;
  relatedOrganization?: string;
  professionalJudgment?: string;
  clientFamilyOpinion?: string;
}

export interface CreateMonitoringRecordInput {
  clientId: string;
  carePlanId: string;
  recordDate: string;
  evaluations: {
    goalId: string;
    goalText: string;
    rating: 1 | 2 | 3 | 4 | 5;
    comment: string;
  }[];
  overallComment: string;
  professionalJudgment: string;
  nextAction: string;
}

export interface CreateCarePlanInput {
  clientId: string;
  createdDate: string;
  purpose: string;
  goals: {
    type: GoalType;
    text: string;
    sortOrder: number;
  }[];
}

// --- AI文章生成 ---
export interface AiGenerateRequest {
  type: 'care_record' | 'monitoring_comment' | 'monitoring_overall' | 'judgment';
  keywords?: string;
  context?: {
    category?: RecordCategory;
    goalText?: string;
    rating?: number;
    evaluations?: { goalText: string; rating: number; comment: string }[];
  };
}

export interface AiGenerateResponse {
  text: string;
  model: string;
}

// --- ユーザー ---
export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: 'ADMIN' | 'CARE_MANAGER';
  googleAccessToken?: string;
  googleRefreshToken?: string;
}

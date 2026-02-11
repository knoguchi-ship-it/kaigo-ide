# Software Design Document (SDD)
# ソフトウェア設計書

**プロダクト名**: KaigoIDE
**文書バージョン**: 0.2.0
**作成日**: 2026年1月29日
**最終更新日**: 2026年2月11日

---

## 1. はじめに

### 1.1 目的
本文書は、KaigoIDE（居宅介護支援事業所向け総合業務支援システム）のソフトウェア設計を定義する。開発チームが一貫した設計方針に基づいて実装を進めるためのガイドラインを提供する。

### 1.2 スコープ
- システムアーキテクチャ
- フロントエンド設計
- バックエンド設計
- データベース設計
- セキュリティ設計
- API設計方針

### 1.3 参照文書
| 文書 | 説明 |
|------|------|
| SOW.md | 作業範囲記述書 |
| PRD.md | プロダクト要件定義書 |
| ADR/ | アーキテクチャ決定記録 |

### 1.4 用語定義
| 用語 | 説明 |
|------|------|
| テナント | システムを利用する事業所単位 |
| クライアント | 介護サービスを受ける利用者 |
| 第5表 | 居宅介護支援経過記録 |
| 第4表 | サービス担当者会議の要点 |

---

## 2. システムアーキテクチャ

### 2.1 全体構成

```
┌─────────────────────────────────────────────────────────────────────┐
│                          クライアント層                              │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Browser    │  │   Tablet     │  │ Smartphone   │              │
│  │   (PC)       │  │   (PWA)      │  │   (PWA)      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│           │                │                │                       │
│           └────────────────┼────────────────┘                       │
│                            ▼                                        │
│                   ┌─────────────────┐                               │
│                   │   React SPA     │                               │
│                   │  (TypeScript)   │                               │
│                   └─────────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          API Gateway                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  AWS API Gateway / Cloud Endpoints / Azure API Management   │   │
│  │  - 認証 (JWT検証)                                            │   │
│  │  - レート制限                                                 │   │
│  │  - ロギング                                                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       アプリケーション層                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    NestJS Application                        │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │   │
│  │  │   Auth    │ │  Client   │ │   Care    │ │Conference │   │   │
│  │  │  Module   │ │  Module   │ │  Record   │ │  Module   │   │   │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                            │                                        │
│              ┌─────────────┼─────────────┐                         │
│              ▼             ▼             ▼                         │
│       ┌───────────┐ ┌───────────┐ ┌───────────┐                   │
│       │  Prisma   │ │   Redis   │ │    S3     │                   │
│       │   ORM     │ │  Cache    │ │  Storage  │                   │
│       └───────────┘ └───────────┘ └───────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         データ層                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐  ┌───────────────────┐                      │
│  │    PostgreSQL     │  │   Redis Cluster   │                      │
│  │   (Primary DB)    │  │  (Cache/Session)  │                      │
│  └───────────────────┘  └───────────────────┘                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 技術スタック

| レイヤー | 技術 | バージョン | 選定理由 |
|---------|------|-----------|----------|
| フロントエンド | React | 18.x | コンポーネントベース、エコシステム |
| 言語 | TypeScript | 5.x | 型安全性、保守性 |
| ビルド | Vite | 5.x | 高速ビルド、HMR |
| 状態管理 | Zustand | 4.x | シンプル、軽量 |
| サーバー状態 | TanStack Query | 5.x | キャッシュ、同期 |
| UIライブラリ | shadcn/ui | - | カスタマイズ性、アクセシビリティ |
| CSS | Tailwind CSS | 3.x | ユーティリティファースト |
| バックエンド | NestJS | 10.x | モジュラー、TypeScript |
| ORM | Prisma | 5.x | 型安全、マイグレーション |
| データベース | PostgreSQL | 16.x | 信頼性、JSON対応 |
| キャッシュ | Redis | 7.x | 高速、セッション管理 |
| テスト | Vitest / Jest | - | 高速、互換性 |
| E2Eテスト | Playwright | - | クロスブラウザ |

---

## 3. フロントエンド設計

### 3.1 ディレクトリ構造

```
apps/web/src/
├── app/                          # アプリケーションエントリー
│   ├── App.tsx
│   ├── routes.tsx                # ルーティング定義
│   └── providers.tsx             # プロバイダー設定
│
├── features/                     # 機能モジュール（Feature-Sliced Design）
│   ├── care-record/              # 支援経過記録（第5表）
│   │   ├── components/           # UIコンポーネント
│   │   │   ├── CareRecordForm.tsx
│   │   │   ├── CareRecordList.tsx
│   │   │   ├── CareRecordItem.tsx
│   │   │   └── CareRecordFilter.tsx
│   │   ├── hooks/                # カスタムフック
│   │   │   ├── useCareRecords.ts
│   │   │   └── useCareRecordMutation.ts
│   │   ├── api/                  # API呼び出し
│   │   │   └── careRecordApi.ts
│   │   ├── types/                # 型定義
│   │   │   └── index.ts
│   │   ├── utils/                # ユーティリティ
│   │   └── index.ts              # Public API
│   │
│   ├── conference/               # 担当者会議（第4表）
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── client/                   # 利用者管理
│   │   └── ...
│   │
│   └── auth/                     # 認証
│       └── ...
│
├── shared/                       # 共有リソース
│   ├── components/               # 共通UIコンポーネント
│   │   ├── ui/                   # 基本UI（Button, Input等）
│   │   ├── layout/               # レイアウト
│   │   └── feedback/             # フィードバック（Toast等）
│   ├── hooks/                    # 共通フック
│   ├── lib/                      # ライブラリ設定
│   ├── utils/                    # ユーティリティ
│   └── types/                    # 共通型定義
│
├── styles/                       # グローバルスタイル
│   └── globals.css
│
└── assets/                       # 静的アセット
```

### 3.2 コンポーネント設計方針

#### 3.2.1 コンポーネント分類

| 分類 | 説明 | 例 |
|------|------|-----|
| UI Components | 汎用的なUIパーツ | Button, Input, Card |
| Feature Components | 機能固有のコンポーネント | CareRecordForm |
| Layout Components | ページレイアウト | MainLayout, Sidebar |
| Page Components | ページ単位のコンポーネント | CareRecordPage |

#### 3.2.2 コンポーネント実装パターン

```typescript
// ■ Propsの型定義
interface CareRecordFormProps {
  clientId: string;
  initialData?: CareRecord;
  onSubmit: (data: CareRecordInput) => void;
  onCancel: () => void;
}

// ■ コンポーネント実装
export function CareRecordForm({
  clientId,
  initialData,
  onSubmit,
  onCancel,
}: CareRecordFormProps) {
  // フォームロジック
  const form = useForm<CareRecordInput>({
    defaultValues: initialData ?? {
      clientId,
      recordDate: new Date(),
      category: 'VISIT',
      content: '',
    },
  });

  // イベントハンドラ
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  // レンダリング
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

### 3.3 状態管理設計

#### 3.3.1 状態の分類

| 状態タイプ | 管理方法 | 例 |
|-----------|---------|-----|
| サーバー状態 | TanStack Query | 利用者一覧、記録データ |
| グローバルUI状態 | Zustand | サイドバー開閉、テーマ |
| ローカル状態 | useState/useReducer | フォーム入力、モーダル |
| URL状態 | React Router | ページ、検索条件 |

#### 3.3.2 Zustand Store例

```typescript
// stores/uiStore.ts
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
}));
```

#### 3.3.3 TanStack Query例

```typescript
// features/care-record/hooks/useCareRecords.ts
export function useCareRecords(clientId: string, filters?: CareRecordFilters) {
  return useQuery({
    queryKey: ['care-records', clientId, filters],
    queryFn: () => careRecordApi.getList(clientId, filters),
    staleTime: 5 * 60 * 1000, // 5分
  });
}

export function useCreateCareRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: careRecordApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['care-records', variables.clientId],
      });
    },
  });
}
```

### 3.4 ルーティング設計

```typescript
// app/routes.tsx
export const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'clients',
        children: [
          { index: true, element: <ClientListPage /> },
          { path: ':clientId', element: <ClientDetailPage /> },
          { path: ':clientId/care-records', element: <CareRecordListPage /> },
          { path: ':clientId/care-records/new', element: <CareRecordFormPage /> },
          { path: ':clientId/care-records/:recordId', element: <CareRecordDetailPage /> },
          { path: ':clientId/conferences', element: <ConferenceListPage /> },
          { path: ':clientId/conferences/new', element: <ConferenceFormPage /> },
          { path: ':clientId/conferences/:conferenceId', element: <ConferenceDetailPage /> },
        ],
      },
      {
        path: 'settings',
        children: [
          { index: true, element: <SettingsPage /> },
          { path: 'profile', element: <ProfilePage /> },
          { path: 'templates', element: <TemplatePage /> },
        ],
      },
    ],
  },
  { path: '/login', element: <LoginPage /> },
  { path: '*', element: <NotFoundPage /> },
];
```

---

## 4. バックエンド設計

### 4.1 ディレクトリ構造

> **注**: 初版では `modules/` ディレクトリ下に Repository レイヤーを含む設計としていたが、
> 実装では Prisma ORM を Service から直接呼び出す簡潔な構造を採用した。
> Repository レイヤーはクエリが複雑化した段階で導入を検討する。

```
services/api/src/
├── main.ts                       # エントリーポイント
├── app.module.ts                 # ルートモジュール
│
├── auth/                         # 認証
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/               # Passport戦略 (JWT, Google OAuth)
│   │   ├── jwt.strategy.ts
│   │   ├── jwt-payload.interface.ts
│   │   └── google.strategy.ts
│   ├── guards/                   # 認証ガード
│   │   └── jwt-auth.guard.ts
│   └── decorators/               # カスタムデコレータ
│       └── current-user.decorator.ts
│
├── client/                       # 利用者管理
│   ├── client.module.ts
│   ├── client.controller.ts
│   ├── client.service.ts
│   └── dto/
│
├── care-plan/                    # ケアプラン簡易管理
│   ├── care-plan.module.ts
│   ├── care-plan.controller.ts
│   ├── care-plan.service.ts
│   └── dto/
│
├── care-record/                  # 支援経過記録（第5表）
│   ├── care-record.module.ts
│   ├── care-record.controller.ts
│   ├── care-record.service.ts
│   ├── care-record-pdf.service.ts  # 第5表PDF生成
│   └── dto/
│
├── monitoring-record/            # モニタリング評価記録
│   ├── monitoring-record.module.ts
│   ├── monitoring-record.controller.ts
│   ├── monitoring-record.service.ts
│   └── dto/
│
├── ai/                           # AI文章生成
│   ├── ai.module.ts
│   ├── ai.controller.ts
│   └── ai.service.ts
│
├── pdf/                          # PDF生成共通
│   ├── pdf.module.ts
│   └── pdf.service.ts            # pdfmake ラッパー + 日本語フォント
│
└── prisma/                       # Prisma
    ├── prisma.module.ts
    └── prisma.service.ts
```

### 4.2 モジュール設計

#### 4.2.1 レイヤードアーキテクチャ

```
┌─────────────────────────────────────────┐
│           Controller Layer              │  ← HTTPリクエスト/レスポンス
├─────────────────────────────────────────┤
│            Service Layer                │  ← ビジネスロジック + データアクセス
├─────────────────────────────────────────┤
│           Prisma ORM (直接)             │  ← DB操作
└─────────────────────────────────────────┘
```

> **注**: Repository レイヤーは省略し、Service から Prisma を直接呼び出す構成を採用。
> クエリが複雑化した段階で Repository の導入を検討する。

#### 4.2.2 モジュール実装例

```typescript
// care-record/care-record.module.ts
@Module({
  imports: [PdfModule],
  controllers: [CareRecordController],
  providers: [CareRecordService, CareRecordPdfService],
  exports: [CareRecordService],
})
export class CareRecordModule {}

// care-record/care-record.controller.ts
@Controller('clients/:clientId/care-records')
@UseGuards(JwtAuthGuard)
export class CareRecordController {
  constructor(
    private readonly careRecordService: CareRecordService,
    private readonly careRecordPdfService: CareRecordPdfService,
  ) {}

  @Get()
  findAll(
    @Param('clientId') clientId: string,
    @Query() query: CareRecordQueryDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.careRecordService.findAll(clientId, query, user.tenantId);
  }

  @Get('export/pdf')
  async exportPdf(
    @Param('clientId') clientId: string,
    @Query() query: ExportPdfQueryDto,
    @CurrentUser() user: AuthUser,
    @Res() res: Response,
  ) {
    const { client, records } = await this.careRecordService.findForExport(
      clientId, { from: query.from, to: query.to }, user.tenantId,
    );
    const pdfBuffer = await this.careRecordPdfService.generateTable5Pdf(
      client, records, user.name, { from: query.from, to: query.to },
    );
    res.set({ 'Content-Type': 'application/pdf' });
    res.end(pdfBuffer);
  }

  @Post()
  create(
    @Param('clientId') clientId: string,
    @Body() dto: CreateCareRecordDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.careRecordService.create(clientId, dto, user.id, user.tenantId);
  }
}

// care-record/care-record.service.ts
@Injectable()
export class CareRecordService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(clientId: string, query: CareRecordQueryDto, tenantId: string) {
    const where: Prisma.CareRecordWhereInput = {
      clientId,
      client: { tenantId },  // テナント分離
    };
    // ... フィルタ条件構築 + ページネーション
  }

  async create(clientId: string, dto: CreateCareRecordDto, createdById: string, tenantId: string) {
    const client = await this.prisma.client.findUnique({ where: { id: clientId } });
    if (!client || client.tenantId !== tenantId) throw new ForbiddenException();
    return this.prisma.careRecord.create({ data: { clientId, ...dto, createdById } });
  }
}
```

### 4.3 認証・認可設計

#### 4.3.1 認証フロー

```
1. ログイン
   Client → POST /auth/login (email, password)
   Server → JWT (access_token, refresh_token)

2. API呼び出し
   Client → GET /api/... (Authorization: Bearer {access_token})
   Server → JwtAuthGuard → JwtStrategy → User

3. トークンリフレッシュ
   Client → POST /auth/refresh (refresh_token)
   Server → 新しい JWT

4. ログアウト
   Client → POST /auth/logout
   Server → refresh_token無効化
```

#### 4.3.2 マルチテナント

```typescript
// 全てのデータアクセスにtenantIdを付与（Service内で直接Prisma呼び出し）
const where: Prisma.CareRecordWhereInput = {
  clientId,
  client: { tenantId },  // テナント分離: clientのtenantIdで検証
};

const records = await this.prisma.careRecord.findMany({
  where,
  orderBy: { recordDate: 'desc' },
  include: { client: true },
});
```

---

## 5. データベース設計

### 5.1 ER図

```
┌─────────────────┐
│     tenants     │
├─────────────────┤       ┌─────────────────┐
│ id              │───────│     users       │
│ name            │       ├─────────────────┤
│ provider_number │       │ id              │
│ created_at      │       │ tenant_id (FK)  │
│ updated_at      │       │ email           │
└─────────────────┘       │ password_hash   │
                          │ name            │
                          │ role            │
                          │ created_at      │
                          │ updated_at      │
                          └─────────────────┘
                                  │
                                  │ 担当
                                  ▼
┌─────────────────────────────────────────────────┐
│                    clients                       │
├─────────────────────────────────────────────────┤
│ id                                               │
│ tenant_id (FK)                                   │
│ insurer_number      (保険者番号)                  │
│ insured_number      (被保険者番号)                │
│ name                                             │
│ name_kana                                        │
│ birth_date                                       │
│ gender                                           │
│ postal_code                                      │
│ address                                          │
│ phone                                            │
│ care_level          (要介護度)                    │
│ certification_start (認定開始日)                  │
│ certification_end   (認定終了日)                  │
│ created_at                                       │
│ updated_at                                       │
└─────────────────────────────────────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌─────────────────────┐   ┌─────────────────────┐
│    care_records     │   │    conferences      │
├─────────────────────┤   ├─────────────────────┤
│ id                  │   │ id                  │
│ client_id (FK)      │   │ client_id (FK)      │
│ record_date         │   │ conference_date     │
│ category            │   │ venue               │
│ content             │   │ purpose             │
│ related_org         │   │ conclusion          │
│ judgment            │   │ next_actions        │
│ family_opinion      │   │ created_by_id (FK)  │
│ created_by_id (FK)  │   │ created_at          │
│ created_at          │   │ updated_at          │
│ updated_at          │   └─────────────────────┘
└─────────────────────┘             │
                                    │
                    ┌───────────────┼───────────────┐
                    ▼                               ▼
          ┌─────────────────────┐       ┌─────────────────────┐
          │     attendees       │       │    agenda_items     │
          ├─────────────────────┤       ├─────────────────────┤
          │ id                  │       │ id                  │
          │ conference_id (FK)  │       │ conference_id (FK)  │
          │ name                │       │ sort_order          │
          │ organization        │       │ topic               │
          │ role                │       │ discussion          │
          │ is_absent           │       │ decision            │
          │ inquiry_date        │       │ created_at          │
          │ inquiry_method      │       │ updated_at          │
          │ inquiry_content     │       └─────────────────────┘
          │ inquiry_response    │
          │ opinion             │
          │ created_at          │
          │ updated_at          │
          └─────────────────────┘
```

### 5.2 Prismaスキーマ

> **注**: 以下は実装中の `services/api/prisma/schema.prisma` を反映した最新版。
> 初版 (v0.1.0) からの主な変更点:
> - Client: 姓名を分割（`familyName` / `givenName`）
> - CareRecord: カラム名を明確化（`relatedOrganization`, `professionalJudgment`, `clientFamilyOpinion`）
> - UserRole: `USER` → `CARE_MANAGER`
> - CarePlan / MonitoringRecord を追加
> - Conference / Attendee / AgendaItem は将来実装（Phase 1ではGoogleカレンダー連携予定）

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// テナント（事業所）
model Tenant {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  users   User[]
  clients Client[]

  @@map("tenants")
}

// ユーザー
model User {
  id                 String   @id @default(cuid())
  email              String   @unique
  name               String
  role               UserRole @default(CARE_MANAGER)
  tenantId           String   @map("tenant_id")
  googleAccessToken  String?  @map("google_access_token")
  googleRefreshToken String?  @map("google_refresh_token")
  hashedPassword     String?  @map("hashed_password")
  createdAt          DateTime @default(now()) @map("created_at")
  updatedAt          DateTime @updatedAt @map("updated_at")

  tenant            Tenant             @relation(fields: [tenantId], references: [id])
  careRecords       CareRecord[]
  monitoringRecords MonitoringRecord[]

  @@index([tenantId])
  @@map("users")
}

enum UserRole {
  ADMIN
  CARE_MANAGER
}

// 利用者
model Client {
  id                String    @id @default(cuid())
  tenantId          String    @map("tenant_id")
  familyName        String    @map("family_name")
  givenName         String    @map("given_name")
  familyNameKana    String    @map("family_name_kana")
  givenNameKana     String    @map("given_name_kana")
  birthDate         DateTime  @map("birth_date")
  gender            Gender
  insuranceNumber   String    @map("insurance_number")
  careLevel         CareLevel @map("care_level")
  certificationDate DateTime  @map("certification_date")
  address           String?
  phone             String?
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  tenant            Tenant             @relation(fields: [tenantId], references: [id])
  carePlans         CarePlan[]
  careRecords       CareRecord[]
  monitoringRecords MonitoringRecord[]

  @@index([tenantId])
  @@map("clients")
}

enum Gender {
  MALE
  FEMALE
}

enum CareLevel {
  SUPPORT_1
  SUPPORT_2
  CARE_1
  CARE_2
  CARE_3
  CARE_4
  CARE_5
}

// ケアプラン簡易管理
model CarePlan {
  id          String   @id @default(cuid())
  clientId    String   @map("client_id")
  version     Int
  createdDate DateTime @map("created_date")
  purpose     String   @default("")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  client            Client             @relation(fields: [clientId], references: [id])
  goals             CarePlanGoal[]
  monitoringRecords MonitoringRecord[]

  @@unique([clientId, version])
  @@index([clientId])
  @@map("care_plans")
}

// ケアプラン目標
model CarePlanGoal {
  id         String   @id @default(cuid())
  carePlanId String   @map("care_plan_id")
  type       GoalType
  text       String
  sortOrder  Int      @default(0) @map("sort_order")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  carePlan              CarePlan               @relation(fields: [carePlanId], references: [id], onDelete: Cascade)
  monitoringEvaluations MonitoringEvaluation[]

  @@index([carePlanId])
  @@map("care_plan_goals")
}

enum GoalType {
  SHORT_TERM
  LONG_TERM
}

// 支援経過記録（一般記録・第5表）
model CareRecord {
  id                    String             @id @default(cuid())
  clientId              String             @map("client_id")
  recordDate            DateTime           @map("record_date")
  category              CareRecordCategory
  content               String
  relatedOrganization   String?            @map("related_organization")
  professionalJudgment  String?            @map("professional_judgment")
  clientFamilyOpinion   String?            @map("client_family_opinion")
  googleCalendarEventId String?            @map("google_calendar_event_id")
  createdById           String             @map("created_by_id")
  createdAt             DateTime           @default(now()) @map("created_at")
  updatedAt             DateTime           @updatedAt @map("updated_at")

  client    Client @relation(fields: [clientId], references: [id])
  createdBy User   @relation(fields: [createdById], references: [id])

  @@index([clientId, recordDate(sort: Desc)])
  @@map("care_records")
}

enum CareRecordCategory {
  VISIT
  PHONE
  FAX
  MAIL
  CONFERENCE
  OTHER
}

// モニタリング評価記録
model MonitoringRecord {
  id                    String   @id @default(cuid())
  clientId              String   @map("client_id")
  carePlanId            String   @map("care_plan_id")
  recordDate            DateTime @map("record_date")
  overallComment        String   @map("overall_comment")
  professionalJudgment  String   @map("professional_judgment")
  nextAction            String   @map("next_action")
  googleCalendarEventId String?  @map("google_calendar_event_id")
  createdById           String   @map("created_by_id")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  client      Client                 @relation(fields: [clientId], references: [id])
  carePlan    CarePlan               @relation(fields: [carePlanId], references: [id])
  createdBy   User                   @relation(fields: [createdById], references: [id])
  evaluations MonitoringEvaluation[]

  @@index([clientId, recordDate(sort: Desc)])
  @@map("monitoring_records")
}

// モニタリング評価（目標別）
model MonitoringEvaluation {
  id                 String @id @default(cuid())
  monitoringRecordId String @map("monitoring_record_id")
  goalId             String @map("goal_id")
  goalText           String @map("goal_text")
  rating             Int
  comment            String @default("")

  monitoringRecord MonitoringRecord @relation(fields: [monitoringRecordId], references: [id], onDelete: Cascade)
  goal             CarePlanGoal     @relation(fields: [goalId], references: [id])

  @@index([monitoringRecordId])
  @@map("monitoring_evaluations")
}
```

---

## 6. API設計

### 6.1 設計原則

- RESTful設計
- リソース指向URL
- HTTPメソッドの適切な使用
- 一貫したレスポンス形式
- 適切なステータスコード

### 6.2 エンドポイント一覧

#### 認証

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| POST | /auth/login | ログイン |
| POST | /auth/logout | ログアウト |
| POST | /auth/refresh | トークンリフレッシュ |
| GET | /auth/me | 現在のユーザー情報 |

#### 利用者

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /clients | 利用者一覧 |
| POST | /clients | 利用者作成 |
| GET | /clients/:id | 利用者詳細 |
| PATCH | /clients/:id | 利用者更新 |
| DELETE | /clients/:id | 利用者削除 |

#### 支援経過記録（第5表）

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /clients/:clientId/care-records | 記録一覧 |
| POST | /clients/:clientId/care-records | 記録作成 |
| GET | /clients/:clientId/care-records/:id | 記録詳細 |
| PATCH | /clients/:clientId/care-records/:id | 記録更新 |
| DELETE | /clients/:clientId/care-records/:id | 記録削除 |
| GET | /clients/:clientId/care-records/export/pdf | PDF出力 |

#### 担当者会議（第4表）

| メソッド | エンドポイント | 説明 |
|---------|---------------|------|
| GET | /clients/:clientId/conferences | 会議一覧 |
| POST | /clients/:clientId/conferences | 会議作成 |
| GET | /clients/:clientId/conferences/:id | 会議詳細 |
| PATCH | /clients/:clientId/conferences/:id | 会議更新 |
| DELETE | /clients/:clientId/conferences/:id | 会議削除 |
| GET | /clients/:clientId/conferences/:id/export/pdf | PDF出力 |

### 6.3 レスポンス形式

```typescript
// 単一リソースレスポンス（直接返却）
{
  "id": "clx...",
  "clientId": "clx...",
  "recordDate": "2026-01-15T10:30:00.000Z",
  "category": "VISIT",
  "content": "...",
  ...
}

// 一覧レスポンス（ページネーション）
{
  "data": [ ... ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}

// エラーレスポンス（NestJS標準）
{
  "statusCode": 400,
  "message": ["content must be a string"],
  "error": "Bad Request"
}
```

---

## 7. セキュリティ設計

### 7.1 認証

- JWT (JSON Web Token) による認証
- アクセストークン有効期限: 15分
- リフレッシュトークン有効期限: 7日
- リフレッシュトークンはHTTP Only Cookieで管理

### 7.2 認可

- RBAC (Role-Based Access Control)
- テナント分離による水平権限管理

| ロール | 権限 |
|--------|------|
| ADMIN | 全機能 + ユーザー管理 + マスタ管理 |
| USER | 担当利用者のCRUD操作 |

### 7.3 データ保護

- 通信: TLS 1.2以上
- 保存データ: AES-256暗号化
- パスワード: bcrypt (cost factor: 12)

### 7.4 監査ログ

全ての操作を監査ログとして記録:
- 操作日時
- 操作者
- 操作種別
- 対象リソース
- 操作前後のデータ

---

## 8. 性能設計

### 8.1 キャッシュ戦略

| データ | TTL | 戦略 |
|--------|-----|------|
| ユーザーセッション | 30分 | Redis |
| マスタデータ | 1時間 | Redis + ブラウザキャッシュ |
| 利用者一覧 | 5分 | TanStack Query |

### 8.2 インデックス設計

```sql
-- 頻繁にアクセスされるクエリのインデックス
CREATE INDEX idx_care_records_client_date ON care_records(client_id, record_date DESC);
CREATE INDEX idx_conferences_client_date ON conferences(client_id, conference_date DESC);
CREATE INDEX idx_clients_tenant ON clients(tenant_id);
```

---

## 9. テスト戦略

### 9.1 テストピラミッド

```
        /\
       /  \  E2E (Playwright)
      /----\  10%
     /      \
    /  Integration  \  30%
   /    (API/DB)     \
  /------------------\
 /      Unit Tests    \  60%
/   (Components/Logic) \
--------------------------
```

### 9.2 テスト対象

| レイヤー | テスト種別 | ツール |
|---------|----------|--------|
| フロントエンド | Unit | Vitest + Testing Library |
| フロントエンド | E2E | Playwright |
| バックエンド | Unit | Jest |
| バックエンド | Integration | Jest + Supertest |
| API | Contract | Pact (将来) |

---

## 改訂履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|----------|--------|
| 0.1.0 | 2026-01-29 | 初版作成 | |
| 0.2.0 | 2026-02-11 | 実装に合わせて同期: ディレクトリ構造、Prismaスキーマ、レスポンス形式、モジュール実装例を更新 | Claude Code |

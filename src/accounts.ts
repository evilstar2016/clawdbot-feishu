import type { ClawdbotConfig } from "openclaw/plugin-sdk";
import { DEFAULT_ACCOUNT_ID } from "openclaw/plugin-sdk";
import type { FeishuConfig, FeishuDomain, ResolvedFeishuAccount } from "./types.js";

export function resolveFeishuAccountCredentials(params: { cfg?: FeishuConfig, accountId?: string }): {
  appId: string;
  appSecret: string;
  encryptKey?: string;
  verificationToken?: string;
  domain: FeishuDomain;
} | null {
  const { cfg, accountId = DEFAULT_ACCOUNT_ID } = params;
  if (cfg?.accounts && cfg.accounts[accountId]) {
    const account = cfg.accounts[accountId];
    const appId = account.appId?.trim();
    const appSecret = account.appSecret?.trim();
    if (appId && appSecret) {
      return {
        appId,
        appSecret,
        encryptKey: account.encryptKey?.trim() || undefined,
        verificationToken: account.verificationToken?.trim() || undefined,
        domain: cfg?.domain ?? "feishu",
      };
    }
  }
  // Fallback to old top-level for default account
  if (accountId === DEFAULT_ACCOUNT_ID) {
    return resolveFeishuCredentials(cfg);
  }
  return null;
}

export function resolveFeishuAccount(params: {
  cfg: ClawdbotConfig;
  accountId?: string | null;
}): ResolvedFeishuAccount {
  const feishuCfg = params.cfg.channels?.feishu as FeishuConfig | undefined;
  const enabled = feishuCfg?.enabled !== false;
  const creds = resolveFeishuAccountCredentials({ cfg: feishuCfg, accountId: params.accountId });

  return {
    accountId: params.accountId?.trim() || DEFAULT_ACCOUNT_ID,
    enabled,
    configured: Boolean(creds),
    appId: creds?.appId,
    domain: creds?.domain ?? "feishu",
  };
}

export function listFeishuAccountIds(cfg: ClawdbotConfig): string[] {
  const feishuCfg = cfg.channels?.feishu as FeishuConfig | undefined;
  if (feishuCfg?.accounts) {
    return Object.keys(feishuCfg.accounts);
  }
  return [DEFAULT_ACCOUNT_ID];
}

export function resolveDefaultFeishuAccountId(cfg: ClawdbotConfig): string {
  return listFeishuAccountIds(cfg)[0] || DEFAULT_ACCOUNT_ID;
}

export function listEnabledFeishuAccounts(cfg: ClawdbotConfig): ResolvedFeishuAccount[] {
  return listFeishuAccountIds(cfg)
    .map((accountId) => resolveFeishuAccount({ cfg, accountId }))
    .filter((account) => account.enabled && account.configured);
}

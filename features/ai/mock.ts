import { ApiError, createCollection } from '@nexus/api-client';
import { daysAgo, minutesAgo } from '../_shared/mock-utils';
import { mockRouter } from '../_shared/mock-router';
import { keyFingerprint } from './ai-utils';
import './mock-usage';
import type { AiModel, ConnectionTestResult, ModelCapability, Prompt, Provider, TaskType } from './types';

const SEED_PROVIDERS: Provider[] = [
  { id: 'prov-openai', name: 'OpenAI', type: 'openai-compatible', baseUrl: 'https://api.openai.com/v1', status: 'connected', keyPrefix: 'sk-pro', keyLast4: 'x7Qa', createdAt: daysAgo(210), lastCheckedAt: minutesAgo(35) },
  { id: 'prov-anthropic', name: 'Anthropic', type: 'anthropic', baseUrl: 'https://api.anthropic.com', status: 'connected', keyPrefix: 'sk-ant', keyLast4: 'M2zD', createdAt: daysAgo(180), lastCheckedAt: minutesAgo(12) },
  { id: 'prov-local', name: 'Local runtime', type: 'local', baseUrl: 'https://llm.internal.example.com/v1', status: 'error', keyPrefix: null, keyLast4: null, createdAt: daysAgo(60), lastCheckedAt: minutesAgo(240) },
  { id: 'prov-gateway', name: 'Partner gateway', type: 'openai-compatible', baseUrl: 'https://gateway.example.com/v1', status: 'disabled', keyPrefix: 'gw-liv', keyLast4: '90bc', createdAt: daysAgo(30), lastCheckedAt: null },
];

type ModelSeed = [string, string, string, string, number, number, number, ModelCapability[], boolean, TaskType[]];
const MODEL_SEED: ModelSeed[] = [
  ['prov-openai', 'OpenAI', 'gpt-4o', 'GPT-4o', 128_000, 2.5, 10, ['chat', 'vision', 'tools', 'json'], true, ['chat']],
  ['prov-openai', 'OpenAI', 'gpt-4o-mini', 'GPT-4o mini', 128_000, 0.15, 0.6, ['chat', 'tools', 'json'], true, []],
  ['prov-openai', 'OpenAI', 'text-embedding-3-small', 'Embedding 3 small', 8_000, 0.02, 0, ['embedding'], true, ['embedding']],
  ['prov-anthropic', 'Anthropic', 'claude-sonnet', 'Claude Sonnet', 200_000, 3, 15, ['chat', 'vision', 'tools', 'json'], true, []],
  ['prov-anthropic', 'Anthropic', 'claude-haiku', 'Claude Haiku', 200_000, 0.8, 4, ['chat', 'tools'], true, []],
  ['prov-local', 'Local runtime', 'llama-3-8b', 'Llama 3 8B', 8_000, 0, 0, ['chat'], false, []],
  ['prov-local', 'Local runtime', 'bge-small', 'BGE small', 512, 0, 0, ['embedding'], false, []],
  ['prov-gateway', 'Partner gateway', 'mixtral-8x7b', 'Mixtral 8x7B', 32_000, 0.6, 0.6, ['chat', 'json'], false, []],
];

const SEED_MODELS: AiModel[] = MODEL_SEED.map(([providerId, providerName, modelId, displayName, contextWindow, inputPrice, outputPrice, capabilities, enabled, defaultFor], i) => ({
  id: `model-${i + 1}`, providerId, providerName, modelId, displayName, contextWindow, inputPrice, outputPrice, capabilities, enabled, defaultFor,
}));

const version = (v: number, template: string, note: string, days: number, author = 'Avery Morgan') => ({ version: v, template, note, author, createdAt: daysAgo(days) });
const PROMPT_SEED: Array<[string, string, string[], Prompt['versions']]> = [
  ['Support reply drafter', 'Drafts a polite first reply to a customer ticket.', ['support', 'customer'], [
    version(1, 'Reply to {{customer_name}} about: {{issue}}.', 'First draft', 40),
    version(2, 'You are a support agent for {{product}}. Reply to {{customer_name}} about: {{issue}}. Keep it under 120 words and end with a clear next step.', 'Added tone and length rules', 12, 'Jordan Lee'),
  ]],
  ['Release notes summary', 'Turns a changelog into customer-facing release notes.', ['content', 'product'], [
    version(1, 'Summarise these changes for {{audience}} in three bullet points:\n{{changelog}}', 'Initial version', 25),
  ]],
  ['Ticket classifier', 'Labels a ticket with a category and urgency.', ['support', 'automation'], [
    version(1, 'Classify this ticket as billing, bug or question:\n{{ticket_text}}', 'Initial version', 70),
    version(2, 'Classify this ticket as billing, bug, question or feature_request and rate urgency 1-5:\n{{ticket_text}}', 'More categories', 33),
    version(3, 'Classify the ticket from {{customer_name}} as billing, bug, question or feature_request and rate urgency 1-5. Reply as JSON.\n{{ticket_text}}', 'JSON output and customer name', 5, 'Sam Rivera'),
  ]],
  ['Knowledge base search', 'Rewrites a user question into a search query.', ['search'], [
    version(1, 'Rewrite this question as a concise search query: {{question}}', 'Initial version', 15),
  ]],
];
const SEED_PROMPTS: Prompt[] = PROMPT_SEED.map(([name, description, tags, versions], i) => {
  const latest = versions[versions.length - 1];
  return { id: `prompt-${i + 1}`, name, description, tags, template: latest.template, currentVersion: latest.version, versions, updatedAt: latest.createdAt };
});

export const providersCollection = createCollection<Provider>(SEED_PROVIDERS, { searchFields: ['name', 'baseUrl'], filterFields: ['type', 'status'], defaultSort: { field: 'createdAt', direction: 'asc' } });
export const modelsCollection = createCollection<AiModel>(SEED_MODELS, { searchFields: ['displayName', 'modelId'], filterFields: ['providerId'], defaultSort: { field: 'displayName', direction: 'asc' } });
export const promptsCollection = createCollection<Prompt>(SEED_PROMPTS, { searchFields: ['name', 'description'], defaultSort: { field: 'updatedAt', direction: 'desc' } });

function assertUniqueName(name: string, exceptId?: string) {
  if (providersCollection.all().some((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== exceptId)) {
    throw new ApiError('VALIDATION_ERROR', 'Some of the information provided is not valid.', 422, { name: 'A provider with this name already exists.' });
  }
}

/** The submitted key is reduced to prefix/last4 here and never stored or echoed back. */
function toProviderPatch(body: Record<string, unknown>): Partial<Provider> {
  const { apiKey, enabled, ...rest } = body as { apiKey?: string; enabled?: boolean } & Partial<Provider>;
  const patch: Partial<Provider> = { ...rest };
  if (apiKey) Object.assign(patch, keyFingerprint(apiKey));
  if (enabled !== undefined) patch.status = enabled ? 'connected' : 'disabled';
  return patch;
}

mockRouter.on('GET', '/ai/providers', ({ query }) => providersCollection.list(query));
mockRouter.on('POST', '/ai/providers', ({ body }) => {
  const input = body as { name: string; type: Provider['type']; baseUrl: string; apiKey?: string };
  assertUniqueName(input.name);
  return providersCollection.create({ ...(toProviderPatch(input as never) as Provider), name: input.name, type: input.type, baseUrl: input.baseUrl, status: 'connected', keyPrefix: input.apiKey ? keyFingerprint(input.apiKey).keyPrefix : null, keyLast4: input.apiKey ? keyFingerprint(input.apiKey).keyLast4 : null, createdAt: new Date().toISOString(), lastCheckedAt: null });
});
mockRouter.on('PATCH', '/ai/providers/:id', ({ params, body }) => {
  const name = (body as { name?: string }).name;
  if (name) assertUniqueName(name, params.id);
  return providersCollection.update(params.id, toProviderPatch(body as Record<string, unknown>));
});
mockRouter.on('DELETE', '/ai/providers/:id', ({ params }) => {
  for (const m of modelsCollection.all().filter((x) => x.providerId === params.id)) modelsCollection.remove(m.id);
  return providersCollection.remove(params.id);
});
mockRouter.on('POST', '/ai/providers/:id/test', ({ params }): ConnectionTestResult => {
  const provider = providersCollection.get(params.id);
  if (provider.status === 'disabled') throw new ApiError('CONFLICT', 'Enable the provider before testing the connection.', 409);
  const ok = provider.type !== 'local';
  providersCollection.update(provider.id, { status: ok ? 'connected' : 'error', lastCheckedAt: new Date().toISOString() });
  return ok
    ? { ok, latencyMs: 120 + (provider.name.length * 13) % 180, message: 'Connected. The provider accepted the credentials.' }
    : { ok, latencyMs: 0, message: 'Could not reach the endpoint. Check the base URL and that the runtime is running.' };
});

mockRouter.on('GET', '/ai/models', ({ query }) => modelsCollection.list(query));
mockRouter.on('PATCH', '/ai/models/:id', ({ params, body }) => {
  const { enabled, inputPrice, outputPrice } = body as Partial<AiModel>;
  const patch: Partial<AiModel> = {};
  if (enabled !== undefined) patch.enabled = enabled;
  if (inputPrice !== undefined) patch.inputPrice = inputPrice;
  if (outputPrice !== undefined) patch.outputPrice = outputPrice;
  const model = modelsCollection.get(params.id);
  if (enabled === false) patch.defaultFor = [];
  return modelsCollection.update(model.id, patch);
});
mockRouter.on('POST', '/ai/models/:id/default', ({ params, body }) => {
  const { task } = body as { task: TaskType };
  const model = modelsCollection.get(params.id);
  if (!model.enabled || !model.capabilities.includes(task)) throw new ApiError('CONFLICT', `This model cannot be the default ${task} model.`, 409);
  for (const m of modelsCollection.all()) {
    if (m.defaultFor.includes(task)) modelsCollection.update(m.id, { defaultFor: m.defaultFor.filter((t) => t !== task) });
  }
  return modelsCollection.update(model.id, { defaultFor: [...modelsCollection.get(model.id).defaultFor, task] });
});

mockRouter.on('GET', '/ai/prompts', ({ query }) => promptsCollection.list(query));
mockRouter.on('POST', '/ai/prompts', ({ body }) => {
  const { name, description, tags, template, note } = body as Pick<Prompt, 'name' | 'description' | 'tags' | 'template'> & { note?: string };
  const now = new Date().toISOString();
  return promptsCollection.create({ name, description, tags, template, currentVersion: 1, updatedAt: now, versions: [{ version: 1, template, note: note || 'Initial version', author: 'You', createdAt: now }] });
});
mockRouter.on('PATCH', '/ai/prompts/:id', ({ params, body }) => {
  const prompt = promptsCollection.get(params.id);
  const { name, description, tags, template, note } = body as Partial<Prompt> & { note?: string };
  const now = new Date().toISOString();
  const changed = template !== undefined && template !== prompt.template;
  const versions = changed ? [...prompt.versions, { version: prompt.currentVersion + 1, template: template as string, note: note || 'Edited template', author: 'You', createdAt: now }] : prompt.versions;
  return promptsCollection.update(prompt.id, { name: name ?? prompt.name, description: description ?? prompt.description, tags: tags ?? prompt.tags, template: template ?? prompt.template, versions, currentVersion: versions.length ? versions[versions.length - 1].version : 1, updatedAt: now });
});
mockRouter.on('POST', '/ai/prompts/:id/restore', ({ params, body }) => {
  const prompt = promptsCollection.get(params.id);
  const target = prompt.versions.find((v) => v.version === (body as { version: number }).version);
  if (!target) throw new ApiError('NOT_FOUND', 'That version no longer exists.', 404);
  const next = { version: prompt.currentVersion + 1, template: target.template, note: `Restored version ${target.version}`, author: 'You', createdAt: new Date().toISOString() };
  return promptsCollection.update(prompt.id, { template: target.template, versions: [...prompt.versions, next], currentVersion: next.version, updatedAt: next.createdAt });
});
mockRouter.on('DELETE', '/ai/prompts/:id', ({ params }) => promptsCollection.remove(params.id));


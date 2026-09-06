/**
 * Built-artifact consumer probe: a provider plugin importing only the public
 * entrypoints must see the settings.provider.item slot and the
 * providerDirectory service without any local module augmentation.
 * Typechecks against lib/ (what ships), never src/.
 */

import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-connection/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from 'dsh-llm-providers-ui/client'
import type { Context } from '@deepseek-ai/cordis'
import type { ProviderHeaderOwnership, ProviderRole } from 'dsh-llm-providers-ui/client'

declare const ctx: Context

export function checkConsumerTypes(): string {
  const directory = ctx.providerDirectory
  const stop = directory.register({ key: 'llm-example', role: 'agent', header: 'shared' })
  const role: ProviderRole = directory.roleOf('llm-example')
  const header: ProviderHeaderOwnership = directory.headerOf('llm-example')
  const reader = directory.reader('llm-example')
  const entries = ctx.slots.entriesOfSlot('settings.provider.item')
  stop()
  return role + header + String(reader) + String(entries.length)
}
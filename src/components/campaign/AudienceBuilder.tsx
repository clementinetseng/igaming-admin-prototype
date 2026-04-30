import { useTranslation } from 'react-i18next'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AudienceCondition, AudienceConditionField, MasterAudience } from '@/types/audience'
import { estimateRecipients } from '@/lib/audience'
import { players } from '@/mock/players'
import { formatPlayerCount } from '@/lib/number'

const FIELDS: AudienceConditionField[] = [
  'vipTier','playerStatus','firstDeposit','registrationDays','cumulativeDeposit','verifiedContact',
]

function defaultConditionFor(field: AudienceConditionField): AudienceCondition {
  switch (field) {
    case 'vipTier': return { field, op: '>=', value: 3 }
    case 'playerStatus': return { field, value: 'active' }
    case 'firstDeposit': return { field, value: 'yes' }
    case 'registrationDays': return { field, op: '<=', value: 30 }
    case 'cumulativeDeposit': return { field, value: '100-1000' }
    case 'verifiedContact': return { field, value: 'email' }
  }
}

function ConditionEditor({
  c, onChange, onRemove,
}: { c: AudienceCondition; onChange: (c: AudienceCondition) => void; onRemove: () => void }) {
  const { t } = useTranslation()
  switch (c.field) {
    case 'vipTier':
      return (
        <Row label={t('audience.conditions.vipTier', 'VIP Tier')} onRemove={onRemove}>
          <Select value={c.op} onValueChange={(v) => onChange({ ...c, op: v as typeof c.op })}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value=">=">≥</SelectItem>
              <SelectItem value="<=">≤</SelectItem>
              <SelectItem value="=">=</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number" min={1} max={7} value={c.value}
            onChange={(e) => onChange({ ...c, value: Math.min(7, Math.max(1, Number(e.target.value))) as 1 })}
            className="w-20"
          />
        </Row>
      )
    case 'playerStatus':
      return (
        <Row label={t('audience.conditions.playerStatus', 'Player Status')} onRemove={onRemove}>
          <Select value={c.value} onValueChange={(v) => onChange({ ...c, value: v as typeof c.value })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('audience.values.active', 'Active')}</SelectItem>
              <SelectItem value="dormant">{t('audience.values.dormant', 'Dormant')}</SelectItem>
              <SelectItem value="churned">{t('audience.values.churned', 'Churned')}</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      )
    case 'firstDeposit':
      return (
        <Row label={t('audience.conditions.firstDeposit', 'First Deposit')} onRemove={onRemove}>
          <Select value={c.value} onValueChange={(v) => onChange({ ...c, value: v as typeof c.value })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="yes">{t('audience.values.yes', 'Yes')}</SelectItem>
              <SelectItem value="no">{t('audience.values.no', 'No')}</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      )
    case 'registrationDays':
      return (
        <Row label={t('audience.conditions.registrationDays', 'Registered (days)')} onRemove={onRemove}>
          <Select value={c.op} onValueChange={(v) => onChange({ ...c, op: v as typeof c.op })}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="<=">≤</SelectItem>
              <SelectItem value=">=">≥</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="number" min={1} value={c.value}
            onChange={(e) => onChange({ ...c, value: Number(e.target.value) })}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">{t('audience.units.days', 'days')}</span>
        </Row>
      )
    case 'cumulativeDeposit':
      return (
        <Row label={t('audience.conditions.cumulativeDeposit', 'Cumulative Deposit')} onRemove={onRemove}>
          <Select value={c.value} onValueChange={(v) => onChange({ ...c, value: v as typeof c.value })}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="0-100">$0 – $100</SelectItem>
              <SelectItem value="100-1000">$100 – $1,000</SelectItem>
              <SelectItem value="1000-5000">$1,000 – $5,000</SelectItem>
              <SelectItem value="5000+">$5,000+</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      )
    case 'verifiedContact':
      return (
        <Row label={t('audience.conditions.verifiedContact', 'Verified Contact')} onRemove={onRemove}>
          <Select value={c.value} onValueChange={(v) => onChange({ ...c, value: v as typeof c.value })}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="email">{t('audience.values.emailOnly', 'Email')}</SelectItem>
              <SelectItem value="phone">{t('audience.values.phoneOnly', 'Phone')}</SelectItem>
              <SelectItem value="both">{t('audience.values.both', 'Both')}</SelectItem>
            </SelectContent>
          </Select>
        </Row>
      )
  }
}

function Row({ label, children, onRemove }: { label: string; children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-b-0">
      <span className="text-sm font-medium w-44 shrink-0">{label}</span>
      {children}
      <Button variant="ghost" size="icon" className="ml-auto" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function AudienceBuilder({
  value, onChange,
}: { value: MasterAudience; onChange: (v: MasterAudience) => void }) {
  const { t } = useTranslation()
  const estimate = estimateRecipients(value, players)
  const usedFields = new Set(value.conditions.map((c) => c.field))
  const addable = FIELDS.filter((f) => !usedFields.has(f))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Checkbox
          id="broadcast"
          checked={value.broadcast}
          onCheckedChange={(v) => onChange({ ...value, broadcast: !!v })}
        />
        <Label htmlFor="broadcast" className="font-medium">
          {t('audience.broadcast', 'Broadcast to all players')}
        </Label>
      </div>

      {!value.broadcast && (
        <>
          <div className="border rounded-md p-3">
            {value.conditions.map((c, i) => (
              <ConditionEditor
                key={i}
                c={c}
                onChange={(nc) => {
                  const next = [...value.conditions]; next[i] = nc
                  onChange({ ...value, conditions: next })
                }}
                onRemove={() => onChange({ ...value, conditions: value.conditions.filter((_, j) => j !== i) })}
              />
            ))}
            {addable.length > 0 && (
              <div className="pt-3">
                <Select onValueChange={(field) => onChange({
                  ...value, conditions: [...value.conditions, defaultConditionFor(field as AudienceConditionField)],
                })}>
                  <SelectTrigger className="w-60">
                    <Plus className="h-4 w-4 mr-1" />
                    <SelectValue placeholder={t('audience.addCondition', 'Add condition')} />
                  </SelectTrigger>
                  <SelectContent>
                    {addable.map((f) => (
                      <SelectItem key={f} value={f}>{t(`audience.conditions.${f}`, f)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {value.conditions.length > 1 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">{t('audience.combineWith', 'Combine conditions with')}</span>
              <Select value={value.logic} onValueChange={(v) => onChange({ ...value, logic: v as 'AND' | 'OR' })}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </>
      )}

      <div className="rounded-md bg-muted p-3 flex items-center justify-between">
        <span className="text-sm font-medium">{t('audience.estimateLabel', 'Estimated recipients')}</span>
        <span className="text-lg font-semibold tabular-nums">{formatPlayerCount(estimate)}</span>
      </div>
    </div>
  )
}

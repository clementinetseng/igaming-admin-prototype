import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AudienceBuilder } from '@/components/campaign/AudienceBuilder'
import { ChannelPanelInApp } from '@/components/campaign/ChannelPanelInApp'
import { ChannelPanelEmail } from '@/components/campaign/ChannelPanelEmail'
import { ChannelPanelSMS } from '@/components/campaign/ChannelPanelSMS'
import { ChannelPanelPush } from '@/components/campaign/ChannelPanelPush'
import { ScheduleSection } from '@/components/campaign/ScheduleSection'
import { TestSendDialog } from '@/components/campaign/TestSendDialog'
import { ScheduleConfirmDialog } from '@/components/campaign/ScheduleConfirmDialog'
import { FormSkeleton } from '@/components/common/LoadingSkeleton'
import { campaignStore } from '@/store/campaigns'
import { estimateRecipients } from '@/lib/audience'
import { players } from '@/mock/players'
import { formatDateTimePHT, type AppLocale } from '@/lib/date'
import type { Campaign, ChannelKey, ChannelPanels } from '@/types/campaign'

const EMPTY: Campaign = {
  id: '', name: '', tags: [], status: 'draft',
  masterAudience: { broadcast: false, conditions: [], logic: 'AND' },
  estimatedRecipients: 0,
  channelPanels: {},
  schedule: { type: 'immediate' },
  ignoreQuietHours: false,
  createdBy: '', createdAt: '', updatedAt: '',
}

const DEFAULTS: Required<{ [K in ChannelKey]: NonNullable<ChannelPanels[K]> }> = {
  inApp: { enabled: true, title: '', category: 'personal', bodyRich: '', triggerToast: false },
  email: { enabled: true, subject: '', preheader: '', htmlBody: '<p>Hello {{username}},</p>', senderFrom: 'noreply' },
  sms: { enabled: true, body: '', senderId: 'BRAND' },
  push: { enabled: true, title: '', body: '', ctaUrl: '/' },
}

export default function CampaignForm() {
  const { t, i18n } = useTranslation()
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = !!id
  const locale = (i18n.resolvedLanguage as AppLocale) ?? 'en-US'

  const [loading, setLoading] = useState(editing)
  const [draft, setDraft] = useState<Campaign>(EMPTY)
  const [tagsInput, setTagsInput] = useState('')
  const [testSendChannel, setTestSendChannel] = useState<ChannelKey | undefined>()
  const [scheduleConfirmOpen, setScheduleConfirmOpen] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  useEffect(() => {
    if (!editing) return
    const t1 = setTimeout(() => {
      const c = campaignStore.get(id!)
      if (c) {
        setDraft(c)
        setTagsInput(c.tags.join(', '))
      }
      setLoading(false)
    }, 250)
    return () => clearTimeout(t1)
  }, [id, editing])

  const enabledChannels = useMemo<ChannelKey[]>(() =>
    (['inApp', 'email', 'sms', 'push'] as ChannelKey[]).filter((k) => draft.channelPanels[k]?.enabled),
    [draft.channelPanels]
  )

  const estimate = estimateRecipients(draft.masterAudience, players)

  function setPanel<K extends ChannelKey>(key: K, value: NonNullable<ChannelPanels[K]>) {
    setDraft({ ...draft, channelPanels: { ...draft.channelPanels, [key]: value } })
  }

  function ensurePanel<K extends ChannelKey>(key: K): NonNullable<ChannelPanels[K]> {
    return (draft.channelPanels[key] ?? DEFAULTS[key]) as NonNullable<ChannelPanels[K]>
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!draft.name.trim()) errs.push(t('campaign.form.errors.nameRequired', 'Name is required.'))
    if (!draft.masterAudience.broadcast && draft.masterAudience.conditions.length === 0)
      errs.push(t('campaign.form.errors.audienceRequired', 'Add at least one audience condition or enable broadcast.'))
    if (enabledChannels.length === 0)
      errs.push(t('campaign.form.errors.channelRequired', 'Enable at least one channel.'))
    if (draft.schedule.type === 'datetime' && !draft.schedule.at)
      errs.push(t('campaign.form.errors.scheduleAtRequired', 'Pick a date & time for the schedule.'))
    return errs
  }

  function handleSaveDraft() {
    const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean)
    const next = { ...draft, tags, estimatedRecipients: estimate, status: 'draft' as const }
    if (editing) {
      campaignStore.update(id!, next)
    } else {
      const created = campaignStore.create(next)
      navigate(`/campaigns/${created.id}/edit`, { replace: true })
    }
    toast.success(t('campaign.form.draftSaved', 'Draft saved'))
  }

  function handleScheduleClick() {
    const errs = validate()
    setValidationErrors(errs)
    if (errs.length === 0) setScheduleConfirmOpen(true)
  }

  function handleScheduleConfirm() {
    const tags = tagsInput.split(',').map((s) => s.trim()).filter(Boolean)
    const status: import('@/types/campaign').CampaignStatus =
      draft.schedule.type === 'immediate' ? 'active' : 'scheduled'
    const next = { ...draft, tags, estimatedRecipients: estimate, status, exclusions: {
      optOut: Math.floor(estimate * 0.05),
      frequencyCap: Math.floor(estimate * 0.02),
      suppression: Math.floor(estimate * 0.01),
      unverifiedContact: Math.floor(estimate * 0.08),
    } }
    if (editing) campaignStore.update(id!, next)
    else campaignStore.create(next)
    setScheduleConfirmOpen(false)
    toast.success(t('campaign.form.scheduled', 'Campaign scheduled'))
    navigate('/campaigns')
  }

  if (loading) return <FormSkeleton />

  return (
    <div className="pb-24 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {editing ? t('campaign.form.editTitle', 'Edit Campaign') : t('campaign.form.newTitle', 'New Campaign')}
        </h1>
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            <ul className="list-disc pl-5">
              {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('campaign.form.basicInfo', 'Basic Info')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('campaign.form.name', 'Campaign Name')}</Label>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <Label>{t('campaign.form.tags', 'Tags (comma separated)')}</Label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="seasonal, vip, retention" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('campaign.form.audience', 'Master Audience')}</CardTitle></CardHeader>
          <CardContent>
            <AudienceBuilder
              value={draft.masterAudience}
              onChange={(v) => setDraft({ ...draft, masterAudience: v })}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-base font-medium">{t('campaign.form.channels', 'Channel Panels')}</h2>
          <ChannelPanelInApp value={ensurePanel('inApp')} onChange={(v) => setPanel('inApp', v)} />
          <ChannelPanelEmail value={ensurePanel('email')} onChange={(v) => setPanel('email', v)} onTestSend={() => setTestSendChannel('email')} />
          <ChannelPanelSMS value={ensurePanel('sms')} onChange={(v) => setPanel('sms', v)} onTestSend={() => setTestSendChannel('sms')} />
          <ChannelPanelPush value={ensurePanel('push')} onChange={(v) => setPanel('push', v)} onTestSend={() => setTestSendChannel('push')} />
        </div>

        <ScheduleSection
          schedule={draft.schedule}
          ignoreQuietHours={draft.ignoreQuietHours}
          onScheduleChange={(s) => setDraft({ ...draft, schedule: s })}
          onIgnoreQuietHoursChange={(v) => setDraft({ ...draft, ignoreQuietHours: v })}
        />
      </div>

      <div className="fixed bottom-0 left-60 right-0 bg-background border-t px-8 py-3 flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate('/campaigns')}>{t('common.cancel')}</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>{t('common.saveDraft')}</Button>
          <Button onClick={handleScheduleClick}>{t('campaign.form.scheduleButton', 'Schedule…')}</Button>
        </div>
      </div>

      <TestSendDialog
        open={!!testSendChannel}
        channel={testSendChannel}
        onClose={() => setTestSendChannel(undefined)}
      />

      <ScheduleConfirmDialog
        open={scheduleConfirmOpen}
        recipients={estimate}
        exclusions={{
          optOut: Math.floor(estimate * 0.05),
          frequencyCap: Math.floor(estimate * 0.02),
          suppression: Math.floor(estimate * 0.01),
          unverifiedContact: Math.floor(estimate * 0.08),
        }}
        channels={enabledChannels}
        scheduleLabel={
          draft.schedule.type === 'immediate'
            ? t('campaign.schedule.now', 'Immediately')
            : draft.schedule.at ? formatDateTimePHT(draft.schedule.at, locale) : ''
        }
        isBroadcast={draft.masterAudience.broadcast}
        onConfirm={handleScheduleConfirm}
        onClose={() => setScheduleConfirmOpen(false)}
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Edit, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ToggleConfirmDialog } from '@/components/campaign/ToggleConfirmDialog'
import { FormSkeleton } from '@/components/common/LoadingSkeleton'
import { campaignStore } from '@/store/campaigns'
import { formatDateTimePHT, formatRelativePHT, type AppLocale } from '@/lib/date'
import { formatPlayerCount } from '@/lib/number'
import type { Campaign, ChannelKey } from '@/types/campaign'

export default function CampaignDetail() {
  const { id } = useParams()
  const { t, i18n } = useTranslation()
  const locale = (i18n.resolvedLanguage as AppLocale) ?? 'en-US'

  const [loading, setLoading] = useState(true)
  const [campaign, setCampaign] = useState<Campaign | undefined>()
  const [toggleAction, setToggleAction] = useState<'enable' | 'disable' | undefined>()

  useEffect(() => {
    const t1 = setTimeout(() => {
      setCampaign(campaignStore.get(id!))
      setLoading(false)
    }, 250)
    return () => clearTimeout(t1)
  }, [id])

  if (loading) return <FormSkeleton />
  if (!campaign) return <p>{t('campaign.detail.notFound', 'Campaign not found.')}</p>

  const enabledChannels = (['inApp','email','sms','push'] as ChannelKey[])
    .filter((k) => campaign.channelPanels[k]?.enabled)

  function applyToggle(action: 'enable' | 'disable') {
    if (!campaign) return
    const next = action === 'disable' ? 'disabled' : 'active'
    campaignStore.setStatus(campaign.id, next)
    setCampaign({ ...campaign, status: next })
    toast.success(
      action === 'disable'
        ? t('campaign.detail.disabledMsg', 'Campaign disabled')
        : t('campaign.detail.enabledMsg', 'Campaign enabled (no new toast notifications)')
    )
    setToggleAction(undefined)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/campaigns"><ArrowLeft className="h-4 w-4 mr-1" /> {t('common.back')}</Link>
        </Button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-semibold">{campaign.name}</h1>
              <StatusBadge status={campaign.status} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {campaign.tags.map((tg) => <Badge key={tg} variant="secondary">{tg}</Badge>)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {campaign.schedule.at && (
                <>
                  {campaign.status === 'scheduled' ? t('campaign.detail.scheduledFor', 'Scheduled for ') : t('campaign.detail.sentOn', 'Sent on ')}
                  {formatDateTimePHT(campaign.schedule.at, locale)} ({formatRelativePHT(campaign.schedule.at, locale)})
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {campaign.status === 'draft' && (
              <Button asChild><Link to={`/campaigns/${campaign.id}/edit`}><Edit className="h-4 w-4 mr-1" /> {t('common.edit')}</Link></Button>
            )}
            {campaign.status === 'scheduled' && (
              <>
                <Button asChild variant="outline"><Link to={`/campaigns/${campaign.id}/edit`}><Edit className="h-4 w-4 mr-1" /> {t('common.edit')}</Link></Button>
                <Button variant="destructive" onClick={() => { campaignStore.setStatus(campaign.id, 'draft'); setCampaign({ ...campaign, status: 'draft' }); toast.success(t('campaign.detail.scheduleCancelled', 'Schedule cancelled — back to draft')) }}>
                  <X className="h-4 w-4 mr-1" /> {t('campaign.detail.cancelSchedule', 'Cancel Schedule')}
                </Button>
              </>
            )}
            {(campaign.status === 'active' || campaign.status === 'disabled') && (
              <div className="flex items-center gap-2 border rounded-md px-3 py-1.5">
                <span className="text-sm">{campaign.status === 'active' ? t('campaign.detail.enabled', 'Enabled') : t('campaign.detail.disabled', 'Disabled')}</span>
                <Switch
                  checked={campaign.status === 'active'}
                  onCheckedChange={() => setToggleAction(campaign.status === 'active' ? 'disable' : 'enable')}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="audience">
        <TabsList>
          <TabsTrigger value="audience">{t('campaign.detail.tabs.audience', 'Audience')}</TabsTrigger>
          <TabsTrigger value="channels">{t('campaign.detail.tabs.channels', 'Channels')}</TabsTrigger>
          <TabsTrigger value="activity">{t('campaign.detail.tabs.activity', 'Activity')}</TabsTrigger>
        </TabsList>

        <TabsContent value="audience" className="space-y-4 pt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">{t('campaign.detail.audienceSummary', 'Audience Summary')}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('campaign.detail.estimatedRecipients', 'Estimated recipients (snapshot)')}</span>
                <span className="text-2xl font-semibold tabular-nums">{formatPlayerCount(campaign.estimatedRecipients)}</span>
              </div>
              <div>
                {campaign.masterAudience.broadcast ? (
                  <Badge variant="secondary">{t('audience.broadcast', 'Broadcast to all players')}</Badge>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {campaign.masterAudience.conditions.map((c, i) => (
                      <Badge key={i} variant="outline">
                        {t(`audience.conditions.${c.field}`, c.field)}{('op' in c) ? ` ${c.op}` : ''} {('value' in c) ? String(c.value) : ''}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {campaign.exclusions && (
                <div className="text-sm space-y-1 pt-3 border-t">
                  <p className="font-medium mb-2">{t('campaign.scheduleConfirm.excluded', 'Excluded')}</p>
                  <ExclusionRow label={t('campaign.scheduleConfirm.optOut')} value={campaign.exclusions.optOut} />
                  <ExclusionRow label={t('campaign.scheduleConfirm.frequencyCap')} value={campaign.exclusions.frequencyCap} />
                  <ExclusionRow label={t('campaign.scheduleConfirm.suppression')} value={campaign.exclusions.suppression} />
                  <ExclusionRow label={t('campaign.scheduleConfirm.unverifiedContact')} value={campaign.exclusions.unverifiedContact} />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="pt-4">
          {enabledChannels.length === 0 ? (
            <p className="text-muted-foreground">{t('campaign.detail.noChannels', 'No channels enabled.')}</p>
          ) : (
            <Tabs defaultValue={enabledChannels[0]}>
              <TabsList>
                {enabledChannels.map((c) => (
                  <TabsTrigger key={c} value={c}>{t(`campaign.channels.${c}`, c)}</TabsTrigger>
                ))}
              </TabsList>
              {enabledChannels.map((c) => (
                <TabsContent key={c} value={c} className="space-y-4 pt-4">
                  <ChannelPreview campaign={campaign} channel={c} locale={locale} />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </TabsContent>

        <TabsContent value="activity" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <ul className="text-sm space-y-2">
                <li><span className="text-muted-foreground">{formatDateTimePHT(campaign.createdAt, locale)}</span> · {t('campaign.activity.created', 'Created by {{user}}', { user: campaign.createdBy })}</li>
                <li><span className="text-muted-foreground">{formatDateTimePHT(campaign.updatedAt, locale)}</span> · {t('campaign.activity.updated', 'Last updated')}</li>
                {campaign.status === 'disabled' && (
                  <li><span className="text-muted-foreground">{formatDateTimePHT(campaign.updatedAt, locale)}</span> · {t('campaign.activity.disabled', 'Disabled by {{user}}', { user: campaign.createdBy })}</li>
                )}
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">{t('campaign.activity.fullLogHint', 'Full audit history is available in the platform Audit Log.')}</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ToggleConfirmDialog
        open={!!toggleAction}
        action={toggleAction ?? 'disable'}
        recipients={campaign.estimatedRecipients}
        onConfirm={() => applyToggle(toggleAction!)}
        onClose={() => setToggleAction(undefined)}
      />
    </div>
  )
}

function ExclusionRow({ label, value }: { label: string; value: number }) {
  return <div className="flex justify-between"><span>• {label}</span><span className="tabular-nums">{formatPlayerCount(value)}</span></div>
}

function ChannelPreview({ campaign, channel, locale }: { campaign: Campaign; channel: ChannelKey; locale: AppLocale }) {
  const { t } = useTranslation()
  const progress = campaign.sendingProgress?.perChannel[channel]
  const panel = campaign.channelPanels[channel]
  if (!panel) return null

  return (
    <div className="space-y-4">
      {progress && (
        <Card>
          <CardContent className="pt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('campaign.detail.progress', 'Sending progress')}</span>
              <span className="tabular-nums">{formatPlayerCount(progress.sent)} / {formatPlayerCount(progress.total)}</span>
            </div>
            <Progress value={progress.total ? (progress.sent / progress.total) * 100 : 0} />
            <p className="text-xs text-muted-foreground">{t('campaign.detail.lastUpdate', 'Last update')}: {formatDateTimePHT(progress.lastUpdate, locale)}</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('campaign.detail.contentPreview', 'Content preview')}</CardTitle></CardHeader>
        <CardContent>
          {channel === 'inApp' && 'title' in panel && (
            <div>
              <p className="font-medium">{(panel as { title: string }).title}</p>
              <p className="text-sm whitespace-pre-wrap mt-1">{(panel as { bodyRich: string }).bodyRich}</p>
            </div>
          )}
          {channel === 'email' && 'subject' in panel && (
            <div className="space-y-2">
              <p><strong>{t('campaign.email.subject')}:</strong> {(panel as { subject: string }).subject}</p>
              <p className="text-sm text-muted-foreground">{(panel as { preheader: string }).preheader}</p>
              <iframe srcDoc={(panel as { htmlBody: string }).htmlBody} title="Email preview" className="w-full border rounded-md h-48 bg-white" />
            </div>
          )}
          {channel === 'sms' && 'body' in panel && !('subject' in panel) && !('htmlBody' in panel) && (
            <div className="bg-muted rounded-2xl px-4 py-3 max-w-sm">
              <p className="text-sm whitespace-pre-wrap">{(panel as { body: string }).body}</p>
            </div>
          )}
          {channel === 'push' && 'title' in panel && 'ctaUrl' in panel && (
            <div className="border rounded-lg p-3 max-w-sm bg-card shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">brand.ph</p>
              <p className="font-medium text-sm">{(panel as { title: string }).title}</p>
              <p className="text-sm">{(panel as { body: string }).body}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

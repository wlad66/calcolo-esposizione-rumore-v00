import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Clock, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { subscriptionsAPI } from "@/lib/api"

interface TrialBannerProps {
    className?: string
}

export function TrialBanner({ className = "" }: TrialBannerProps) {
    const navigate = useNavigate()
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
    const [expired, setExpired] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSubscriptionStatus()
    }, [])

    const loadSubscriptionStatus = async () => {
        try {
            console.log('[TrialBanner] Caricamento status subscription...')
            const response = await subscriptionsAPI.getSubscriptionStatus()
            console.log('[TrialBanner] Response:', response)
            if (response.data) {
                setExpired(response.data.expired)
                setDaysRemaining(response.data.days_remaining)
                console.log('[TrialBanner] Expired:', response.data.expired, 'Days:', response.data.days_remaining)
            }
        } catch (error) {
            console.error('[TrialBanner] Errore caricamento status subscription:', error)
        } finally {
            setLoading(false)
        }
    }

    // Non mostrare nulla mentre sta caricando
    if (loading) {
        return null
    }

    // Trial scaduto
    if (expired) {
        return (
            <Alert variant="destructive" className={`mb-6 ${className}`}>
                <Clock className="h-5 w-5" />
                <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <strong className="block mb-1">Il tuo trial è scaduto</strong>
                        <span className="text-sm">
                            Effettua l'upgrade per continuare a creare valutazioni. I tuoi dati sono conservati per 30 giorni.
                        </span>
                    </div>
                    <Button
                        onClick={() => navigate('/pricing')}
                        size="sm"
                        className="bg-white text-red-600 hover:bg-red-50"
                    >
                        Upgrade Ora
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

    // Trial attivo - mostra sempre con colori diversi in base ai giorni rimanenti
    if (daysRemaining !== null) {
        // Ultimi 3 giorni: arancione urgente
        if (daysRemaining <= 3) {
            return (
                <Alert className={`mb-6 border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 ${className}`}>
                    <Sparkles className="h-5 w-5 text-orange-600" />
                    <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <strong className="block mb-1 text-orange-900">
                                {daysRemaining === 0
                                    ? "Ultimo giorno di prova!"
                                    : `Ti rimangono ${daysRemaining} ${daysRemaining === 1 ? 'giorno' : 'giorni'} di prova`}
                            </strong>
                            <span className="text-sm text-orange-800">
                                Passa a Professional per soli €55/anno e continua senza interruzioni
                            </span>
                        </div>
                        <Button
                            onClick={() => navigate('/pricing')}
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                        >
                            Vedi Piani
                        </Button>
                    </AlertDescription>
                </Alert>
            )
        }

        // Più di 3 giorni: blu informativo
        return (
            <Alert className={`mb-6 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 ${className}`}>
                <Sparkles className="h-5 w-5 text-blue-600" />
                <AlertDescription className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <strong className="block mb-1 text-blue-900">
                            Prova gratuita attiva - {daysRemaining} {daysRemaining === 1 ? 'giorno' : 'giorni'} rimanenti
                        </strong>
                        <span className="text-sm text-blue-800">
                            Stai usando tutte le funzionalità Professional. Passa al piano annuale per soli €55/anno.
                        </span>
                    </div>
                    <Button
                        onClick={() => navigate('/pricing')}
                        size="sm"
                        variant="outline"
                        className="border-blue-600 text-blue-700 hover:bg-blue-100"
                    >
                        Vedi Piani
                    </Button>
                </AlertDescription>
            </Alert>
        )
    }

    return null
}

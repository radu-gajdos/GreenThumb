import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActionApi } from '@/features/actions/api/action.api'
import { IAction } from '@/features/plots/interfaces/plot'
import ActionCalendar from './ActionCalendar'
import { PlotApi } from '@/features/plots/api/plot.api'
import { Action } from '@/features/actions/interfaces/action'

const ActionsCalendarView: React.FC = () => {
    const [actions, setActions] = useState<Action[]>([])
    const [loading, setLoading] = useState(true)
    const plotApi = new PlotApi()

    useEffect(() => {
        const fetchActions = async () => {
            try {
                const plots = await plotApi.findAll()
                // Extract actions from all plots and flatten into a single array
                const allActions = plots.flatMap(plot => plot.actions || [])
                setActions(allActions)
            } catch (error) {
                console.error('Error fetching actions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchActions()
    }, [])

    return (
        <div className="container mx-auto py-8">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Actions Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-[60vh]">
                            <p>Loading calendar...</p>
                        </div>
                    ) : (
                        <ActionCalendar actions={actions} />
                    )}

                </CardContent>
            </Card>
        </div>
    )
}

export default ActionsCalendarView
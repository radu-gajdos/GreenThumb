// import React, { useState } from 'react'
// import FullCalendar from '@fullcalendar/react'
// import dayGridPlugin from '@fullcalendar/daygrid'
// import timeGridPlugin from '@fullcalendar/timegrid'
// import interactionPlugin from '@fullcalendar/interaction'
// import listPlugin from '@fullcalendar/list'
// import { Card, CardContent } from "@/components/ui/card"
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog"
// import ActionItem from '@/features/plots/pages/PlotPage/ActionItems'
// import { Action } from '@/features/actions/interfaces/action'
// import { ActionType, getActionIcon } from '@/features/actions/constants/formSchema'
// import { EventInput } from '@fullcalendar/core'
// import './calendar-styles.css' // We'll create this file for custom styling

// interface CalendarViewProps {
//   actions: Action[]
// }

// const ActionCalendar: React.FC<CalendarViewProps> = ({ actions }) => {
//   const [selectedAction, setSelectedAction] = useState<Action | null>(null)
//   const [isDialogOpen, setIsDialogOpen] = useState(false)

//   // Get the appropriate color for each action type
//   const getActionColor = (type: string): string => {
//     switch (type) {
//       case 'planting':
//         return '#22c55e' // green-500
//       case 'harvesting':
//         return '#eab308' // yellow-500
//       case 'fertilizing':
//         return '#f59e0b' // amber-500
//       case 'treatment':
//         return '#ef4444' // red-500
//       case 'watering':
//         return '#3b82f6' // blue-500
//       case 'soil_reading':
//         return '#a855f7' // purple-500
//       default:
//         return '#6b7280' // gray-500
//     }
//   }

//   // Format actions as FullCalendar events
//   const getEvents = (): EventInput[] => {
//     return actions
//       .filter(action => action.date) // Filter out actions without a date
//       .map(action => {
//         return {
//           id: action.id,
//           title: `${action.type.charAt(0).toUpperCase() + action.type.slice(1).replace('_', ' ')}`,
//           start: action.date, 
//           allDay: true,
//           backgroundColor: getActionColor(action.type),
//           borderColor: getActionColor(action.type),
//           extendedProps: {
//             action
//           }
//         } as EventInput
//       })
//   }

//   // Handle event click to show details
//   const handleEventClick = (info: any) => {
//     setSelectedAction(info.event.extendedProps.action)
//     setIsDialogOpen(true)
//   }

//   return (
//     <div>
//       <CardContent className="p-0">
//         <div className="flex h-[75vh] flex-col shadcn-calendar">
//           <FullCalendar
//             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
//             headerToolbar={{
//               left: 'prev,next today',
//               center: 'title',
//               right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
//             }}
//             initialView="dayGridMonth"
//             weekends={true}
//             events={getEvents()}
//             eventClick={handleEventClick}
//             height="100%"
//             eventTimeFormat={{
//               hour: '2-digit',
//               minute: '2-digit',
//               meridiem: false
//             }}
//             slotLabelFormat={{
//               hour: '2-digit',
//               minute: '2-digit',
//               hour12: false
//             }}
//             buttonText={{
//               today: 'Today',
//               month: 'Month',
//               week: 'Week',
//               day: 'Day',
//               list: 'List'
//             }}
//             eventContent={(eventInfo) => (
//               <div className="flex items-center gap-1 p-1 overflow-hidden rounded">
//                 <div className="flex-shrink-0">
//                   {React.cloneElement(
//                     getActionIcon(eventInfo.event.extendedProps.action.type as ActionType) as React.ReactElement, 
//                     { size: 16, color: "white" }
//                   )}
//                 </div>
//                 <div className="font-medium text-white truncate">
//                   {eventInfo.event.title}
//                 </div>
//               </div>
//             )}
//           />
//         </div>
//       </CardContent>

//       {/* Action Detail Dialog */}
//       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//         <DialogContent className="sm:max-w-lg">
//           <DialogHeader>
//             <DialogTitle>Action Details</DialogTitle>
//           </DialogHeader>
//           {selectedAction && (
//             <div className="py-4">
//               <ActionItem action={selectedAction} />
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

// export default ActionCalendar
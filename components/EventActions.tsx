import React from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Material } from 'lib/material'
import { EventFull, Event } from 'lib/types'
import Title from 'components/Title'
import { basePath } from 'lib/basePath'
import { useActiveEvent } from 'lib/hooks';
import { useSession } from 'next-auth/react';
import EnrolDialog from 'components/EnrolDialog';
import useSWR, { Fetcher } from 'swr'
import { UserOnEvent } from '@prisma/client';
import { Button } from 'flowbite-react';


type EventActionsProps = {
  material: Material,
  activeEvent: EventFull | undefined,
  event: Event,
  setActiveEvent: (event: EventFull | Event | null) => void,
  myEvents: EventFull[] | undefined,
}

const userOnEventFetcher: Fetcher<UserOnEvent, string> = url => fetch(url).then(r => r.json())

const EventActions: React.FC<EventActionsProps> = ({ material, activeEvent, setActiveEvent, event, myEvents }) => {
  const { data: session } = useSession()
  const [showEvent, setShowEvent] = React.useState<Event | null>(null)
  const { data: userOnEvent, error, mutate } = useSWR(`${basePath}/api/userOnEvent/${event.id}`, userOnEventFetcher)

  const handleActivate = (event: Event) => () => {
    setActiveEvent(event)
  }
  const handleDeactivate = (event: Event) => () => {
    setActiveEvent(null)
  }
  const handleEnrol = (event: Event) => () => {
    setShowEvent(event)
  }
  
  const setShow = (show: boolean) => {
    setShowEvent(show ? showEvent : null)
  }
  
  
  const onEnrol = (userOnEvent: UserOnEvent | null) => {
    if (userOnEvent) {
      mutate(userOnEvent)
    }
    setShowEvent(null)
  }

  const myEventIds = myEvents ? myEvents.map((event) => event.id) : []
  const isMyEvent = myEventIds.includes(event.id);
  const isRequested = userOnEvent ? userOnEvent.eventId == event.id && userOnEvent.status == 'REQUEST' : false
  const isActiveEvent = activeEvent ? activeEvent.id == event.id : false

  return (
    <div className="flex flex-row gap-2">
    { isActiveEvent ? (
        <Button color="gray" onClick={handleDeactivate(event)}>
        Unselect 
        <HiArrowNarrowRight className="ml-2 h-3 w-3" />
        </Button>
    ): isMyEvent ? (
        <Button color="gray" onClick={handleActivate(event)}>
        Select 
        <HiArrowNarrowRight className="ml-2 h-3 w-3" />
        </Button>
    ): isRequested ? (
        <Button color="gray" disabled>
        Requested
        </Button>
    ): session && (
    <>
        <Button color="gray" onClick={handleEnrol(event)}>
        Enroll 
        <HiArrowNarrowRight className="ml-2 h-3 w-3" />
        </Button>
        <EnrolDialog event={event} show={showEvent == event} onEnrol={onEnrol} />
    </>
    )}
    </div>
  )
}
  

export default EventActions;
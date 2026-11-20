import { useCallback, useMemo, useRef, useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Inbox from '../components/Inbox';
import Timeline from '../components/Timeline';
import ScheduleSheet from '../components/ScheduleSheet';
import { TaskCard } from '../components/TaskCard';
import { Calendar, Inbox as InboxIcon, Plus } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import useTasks, { INBOX } from '../hooks/useTasks';
import { addDays, formatHour, todayKey } from '../lib/dates';

export default function Workspace() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState(todayKey);
  const isToday = date === todayKey();

  const {
    byId,
    groups,
    loading,
    loadError,
    reload,
    addTask,
    toggleTask,
    renameTask,
    deleteTask,
    scheduleTask,
    commitDrag,
  } = useTasks(date);

  const [tab, setTab] = useState('today'); // phones only: 'inbox' | 'today'
  const [scheduling, setScheduling] = useState(null); // task being scheduled in the sheet
  const inboxInputRef = useRef(null);

  // ---------- drag and drop ----------
  const [dragItems, setDragItems] = useState(null); // working copy of `groups` while dragging
  const [activeId, setActiveId] = useState(null);
  const dragFrom = useRef(null);
  const items = dragItems ?? groups;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }), // long-press on phones
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const findContainer = useCallback(
    (id, source = items) => {
      if (id == null) return null;
      if (id in source) return id; // a container itself (empty slot or the inbox panel)
      return Object.keys(source).find((key) => source[key].includes(id)) ?? null;
    },
    [items]
  );

  const onDragStart = ({ active }) => {
    setActiveId(active.id);
    setDragItems(groups);
    dragFrom.current = findContainer(active.id, groups);
  };

  // Moving across containers: move the id into the new list right away so the UI follows the pointer
  const onDragOver = ({ active, over }) => {
    if (!over) return;
    setDragItems((prev) => {
      const source = prev ?? groups;
      const from = findContainer(active.id, source);
      const to = findContainer(over.id, source);
      if (!from || !to || from === to) return prev;
      const fromList = source[from].filter((id) => id !== active.id);
      const toList = [...source[to]];
      const overIndex = toList.indexOf(over.id);
      toList.splice(overIndex >= 0 ? overIndex : toList.length, 0, active.id);
      return { ...source, [from]: fromList, [to]: toList };
    });
  };

  const resetDrag = () => {
    setDragItems(null);
    setActiveId(null);
    dragFrom.current = null;
  };

  const onDragEnd = ({ active, over }) => {
    const from = dragFrom.current;
    if (!over || !dragItems) return resetDrag();

    const to = findContainer(over.id, dragItems);
    if (!to) return resetDrag();

    let list = dragItems[to];
    const oldIndex = list.indexOf(active.id);
    const newIndex = over.id in dragItems ? list.length - 1 : list.indexOf(over.id);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) list = arrayMove(list, oldIndex, newIndex);

    const orderChanged = list.join() !== (groups[to] || []).join();
    if (from !== to || orderChanged) commitDrag(active.id, from, to, list);
    resetDrag();
  };

  const announcements = useMemo(
    () => ({
      onDragStart: ({ active }) => `Picked up ${byId[active.id]?.title ?? 'task'}.`,
      onDragOver: ({ over }) => (over ? `Over ${labelFor(findContainer(over.id))}.` : 'Not over a drop area.'),
      onDragEnd: ({ over }) => (over ? `Dropped in ${labelFor(findContainer(over.id))}.` : 'Drop cancelled.'),
      onDragCancel: () => 'Drop cancelled.',
    }),
    [byId, findContainer]
  );

  // ---------- task actions shared by every card ----------
  const cardProps = {
    onToggle: toggleTask,
    onRename: renameTask,
    onDelete: deleteTask,
    onSchedule: setScheduling,
    onUnschedule: (id) => scheduleTask(id, null, null),
  };

  const goToInboxAndType = () => {
    setTab('inbox');
    setTimeout(() => inboxInputRef.current?.focus(), 50);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const activeTask = activeId ? byId[activeId] : null;
  const inboxCount = groups[INBOX].length;

  return (
    <div className="min-h-screen bg-ground pb-28 lg:pb-12">
      <Header
        date={date}
        isToday={isToday}
        onPrev={() => setDate((d) => addDays(d, -1))}
        onNext={() => setDate((d) => addDays(d, 1))}
        onToday={() => setDate(todayKey())}
        user={user}
        onLogout={handleLogout}
      />

      {loadError && (
        <div role="alert" className="mx-auto mt-4 flex max-w-[1360px] items-center justify-between gap-3 px-4 sm:px-8">
          <p className="flex-1 rounded-xl border border-[#FECDCA] bg-[#FEF3F2] px-4 py-3 text-sm text-[#912018]">
            Couldn’t load your tasks.{' '}
            <button type="button" onClick={reload} className="font-semibold underline">
              Try again
            </button>
          </p>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={resetDrag}
        accessibility={{ announcements }}
      >
        <main className="mx-auto flex max-w-[1360px] flex-col gap-6 px-3 pt-4 sm:px-8 sm:pt-6 lg:flex-row lg:items-start">
          <div
            className={`${tab === 'inbox' ? 'block' : 'hidden'} lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7.5rem)] lg:w-[380px] lg:shrink-0 lg:overflow-y-auto lg:rounded-2xl`}
          >
            <Inbox
              ref={inboxInputRef}
              ids={items[INBOX]}
              byId={byId}
              loading={loading}
              isDropTarget={!!activeId && findContainer(activeId) === INBOX && dragFrom.current !== INBOX}
              onAdd={addTask}
              cardProps={cardProps}
            />
          </div>

          <div className={`${tab === 'today' ? 'block' : 'hidden'} min-w-0 flex-1 lg:block`}>
            <Timeline groups={items} byId={byId} isToday={isToday} loading={loading} activeId={activeId} cardProps={cardProps} />
          </div>
        </main>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <TaskCard task={activeTask} variant="inbox" isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Phones: add button + bottom tabs */}
      {tab === 'today' && (
        <button
          type="button"
          onClick={goToInboxAndType}
          aria-label="Add to brain dump"
          className="fixed bottom-24 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-[18px] bg-accent text-white shadow-[0_12px_24px_-8px_rgba(79,70,229,0.55)] hover:bg-accent-hover lg:hidden"
        >
          <Plus size={24} />
        </button>
      )}

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-2 border-t border-line bg-white px-3 pb-[max(14px,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
      >
        <TabButton active={tab === 'inbox'} onClick={() => setTab('inbox')} label="Brain dump" badge={inboxCount}>
          <InboxIcon />
        </TabButton>
        <TabButton active={tab === 'today'} onClick={() => setTab('today')} label={isToday ? 'Today' : 'Timeline'}>
          <Calendar />
        </TabButton>
      </nav>

      {scheduling && (
        <ScheduleSheet
          task={scheduling}
          viewDate={date}
          groups={groups}
          onClose={() => setScheduling(null)}
          onPick={(id, d, h) => {
            scheduleTask(id, d, h);
            setScheduling(null);
          }}
          onUnschedule={(id) => {
            scheduleTask(id, null, null);
            setScheduling(null);
          }}
        />
      )}
    </div>
  );
}

function labelFor(container) {
  if (!container) return 'nowhere';
  if (container === INBOX) return 'the brain dump';
  return formatHour(Number(container.slice(5)));
}

function TabButton({ active, onClick, label, badge, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex min-h-[52px] flex-col items-center justify-center gap-1 text-xs ${
        active ? 'font-bold text-accent-ink' : 'font-medium text-muted'
      }`}
    >
      <span className={`relative flex ${active ? 'text-accent' : ''}`}>
        {children}
        {badge > 0 && (
          <span className="absolute -right-3 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-white">
            {badge}
          </span>
        )}
      </span>
      {label}
    </button>
  );
}

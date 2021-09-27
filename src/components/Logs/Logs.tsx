import React from 'react';
import { Calendar, Header, Select, Tooltip } from '@megafon/ui-core';
import type { ISelectItem } from '@megafon/ui-core/dist/lib/components/Select/Select';
import { cnCreate } from '@megafon/ui-helpers';
import { ReactComponent as CalendarIcon } from '@megafon/ui-icons/basic-16-calendar_16.svg';
import { ReactComponent as Cancel } from '@megafon/ui-icons/system-16-cancel_16.svg';
import type { LogsItem, LogsResponse } from 'api/types';
import { useDispatch, useSelector } from 'store/hooks';
import { getLogsAsync } from 'store/logs/logsSlice';
import { format } from "date-fns";
import './Logs.pcss';

const GET_LOGS_TIMER_SECONDS = 10000;
const TIMESTAMP_DIVIDER = 1000;
const HOURS = 24;
const MINUTES = 60;

const HOUR_ITEMS: ISelectItem<number>[] = Array(HOURS)
    .fill(1)
    .map<ISelectItem<number>>((_x, i) => ({ title: `${i}`, value: i }));
const MINUTE_ITEMS: ISelectItem<number>[] = Array(MINUTES)
    .fill(1)
    .map<ISelectItem<number>>((_x, i) => ({ title: `${i}`, value: i }));

const cn = cnCreate('logs');
const Logs: React.FC = () => {
    const dispatch = useDispatch();
    const statusState = !!useSelector(state => state.status.value);
    const logsStore = useSelector(state => state.logs);

    const [state, setState] = React.useState<LogsResponse['logs']>([]);
    const [hourState, setHourState] = React.useState<number>(0);
    const [minuteState, setMinuteState] = React.useState<number>(0);
    const [time, setTime] = React.useState<Date | null>(null);
    const timeRef = React.useRef<Date | null>(null);
    const iconRef = React.useRef<HTMLElement | null>(null);

    function getRef(node: SVGSVGElement) {
        iconRef.current = node as unknown as HTMLElement;
    }

    function handleChangeTime(date: Date) {
        setTime(date);
        timeRef.current = date;
    }

    function handleSelectTime(dateTime: 'hour' | 'minute') {
        return (_e: React.MouseEvent<HTMLDivElement>, item: ISelectItem<number>) => {
            const newDate = timeRef.current ? new Date(timeRef.current) : new Date();
            if (dateTime === 'hour') {
                newDate.setHours(item.value);
                setHourState(item.value);

                timeRef.current = newDate;

                return;
            }

            newDate.setMinutes(item.value);
            timeRef.current = newDate;
            setMinuteState(item.value);
        };
    }

    function handleClickReset(_e: React.MouseEvent<SVGElement>) {
        setHourState(0);
        setMinuteState(0);
        setTime(null);
        timeRef.current = null;
    }

    function getDate(date: Date) {
        const newDate = new Date(date);
        newDate.setHours(hourState);
        newDate.setMinutes(minuteState);

        return newDate;
    }

    React.useEffect(() => {
        if (!statusState) {
            return;
        }

        if (time) {
            dispatch(getLogsAsync({
                from: getDate(time).getTime() / TIMESTAMP_DIVIDER
            }));

        }
    }, [statusState, time, hourState, minuteState]);

    React.useEffect(() => {
        if (statusState) {
            dispatch(getLogsAsync(timeRef.current ? { from: timeRef.current.getTime() / TIMESTAMP_DIVIDER } : undefined));
        }

        const timer = statusState
            ? setInterval(() => {
                  const formData = timeRef.current ? { from: timeRef.current.getTime() / TIMESTAMP_DIVIDER } : undefined;
                  if (statusState) {
                      dispatch(getLogsAsync(formData));
                  }
              }, GET_LOGS_TIMER_SECONDS)
            : undefined;

        return () => {
            clearInterval(timer as undefined);
        };
    }, [statusState]);

    React.useEffect(() => {
        if (logsStore.type === 'success') {
            setState(logsStore.value.logs || []);
        }
    }, [logsStore]);

    const renderAdditional = (log: LogsItem) => {
        if (log.Destination && log.Mode && log.WebserverPort) {
            return (
                <div className={cn('item-additional')}>
                    Destination={log.Destination} Mode={log.Mode} WebserverPort={log.WebserverPort}
                </div>
            );
        }

        if (log.destination && log.mode && log.port) {
            return (
                <div className={cn('item-additional')}>
                    destination={log.destination} mode={log.mode} port={log.port}
                </div>
            );
        }

        if (log.middleware && log.payload) {
            return (
                <>
                    <div className={cn('item-additional')}>middleware={log.middleware}</div>
                    <div className={cn('item-additional')}>payload={log.payload}</div>
                </>
            );
        }

        if (log.command && log.stdin) {
            return (
                <>
                    <div className={cn('item-additional')}>command={log.command}</div>
                    <div className={cn('item-additional')}>stdin={log.stdin}</div>
                </>
            );
        }

        if (log.failed !== undefined && log.successful !== undefined && log.total !== undefined) {
            return (
                <div className={cn('item-additional')}>
                    failed={log.failed} successful={log.successful} total={log.total}
                </div>
            );
        }

        if (log.AdminPort) {
            return <div className={cn('item-additional')}>AdminPort={log.AdminPort}</div>;
        }

        if (log.json) {
            return <div className={cn('item-additional')}>json={log.json}</div>;
        }

        return null;
    };

    const renderTime = (date: Date) => {
        const newDate = new Date(date);
        newDate.setHours(hourState);
        newDate.setMinutes(minuteState);

        return format(newDate, 'dd.MM.yyyy: HH.mm');
    }

    const header = React.useMemo(
        () => (
            <div className={cn('header-wrapper')}>
                <Header as="h2" className={cn('title')}>
                    Logs
                </Header>
                <div>
                    <div>
                        <CalendarIcon className={cn('calendar-icon')} ref={getRef} />
                    </div>
                    <Tooltip triggerElement={iconRef} triggerEvent="click">
                        <div className={cn('time')}>
                            <div>
                                {time && renderTime(time)}
                            </div>
                            <Cancel className={cn('cancel-icon')} onClick={handleClickReset} />
                        </div>
                        <Calendar onChange={handleChangeTime} isSingleDate />
                        <div className={cn('calendar-footer')}>
                            <Select
                                currentValue={hourState}
                                classes={{
                                    control: cn('select'),
                                    title: cn('select-title'),
                                    listItem: cn('select-item'),
                                    listItemTitle: cn('select-item-title'),
                                }}
                                label="hours"
                                items={HOUR_ITEMS}
                                onSelect={handleSelectTime('hour')}
                            />
                            <Select
                                currentValue={minuteState}
                                classes={{
                                    control: cn('select'),
                                    title: cn('select-title'),
                                    listItem: cn('select-item'),
                                    listItemTitle: cn('select-item-title'),
                                }}
                                label="minutes"
                                items={MINUTE_ITEMS}
                                onSelect={handleSelectTime('minute')}
                            />
                        </div>
                    </Tooltip>
                </div>
            </div>
        ),
        [time, hourState, minuteState],
    );

    return (
        <div className={cn()}>
            {header}
            <div className={cn('info')}>
                {state.map((log, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div className={cn('item')} key={index}>
                        {log.time} [{log.level}] {log.msg}
                        {renderAdditional(log)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Logs;
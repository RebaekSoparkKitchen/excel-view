import { Schedule, Guest } from '../typings/Offline';

const isGuestColExist = (schedule: Schedule) => {
  const guestExistItem = schedule.agenda.filter((x) => x.guests.length !== 0);
  return guestExistItem.length > 0;
};

const isGuestIntroExist = (guests: Guest[]) => guests.length > 0;

export { isGuestIntroExist, isGuestColExist };

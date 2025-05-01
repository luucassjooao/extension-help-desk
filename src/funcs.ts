export function calculateDelay(
  timeString: string,
  secondTime?: string
): number | boolean {
  let dateToCalculateDiferrence = new Date();
  if (secondTime) {
    const [hours, minutes] = secondTime.split(":").map(Number);

    dateToCalculateDiferrence.setHours(hours, minutes, 0, 0);
  }

  const [hours, minutes] = timeString.split(":").map(Number);

  const targetDate = new Date();
  targetDate.setHours(hours, minutes, 0, 0);

  if (targetDate <= dateToCalculateDiferrence) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  if (secondTime) {
    const difference = Math.floor(
      (targetDate.getTime() - dateToCalculateDiferrence.getTime()) / 1000 / 60
    );

    console.log(difference);

    if (difference > 60) {
      return true;
    }
    return false;
  }

  return targetDate.getTime() - dateToCalculateDiferrence.getTime();
}

export function shouldDisableButton(
  timeString: string,
  secondTime?: string
): boolean {
  const now = new Date();
  let referenceDate: Date;

  if (secondTime) {
    referenceDate = new Date(now.toDateString() + " " + secondTime);
  } else {
    referenceDate = now;
  }

  const targetDate = new Date(now.toDateString() + " " + timeString);

  if (isNaN(referenceDate.getTime()) || isNaN(targetDate.getTime())) {
    return true;
  }

  if (targetDate > referenceDate) {
    return true;
  }

  return false;
}

export const convert24To12Hour = (time) => {
    if (!time) return '';
  
    const [hours, minutes] = time.split(':').map(Number);

    const period = hours >= 12 ? 'PM' : 'AM';
  
    const twelveHourFormat = hours % 12 || 12;
  
    return `${twelveHourFormat}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  
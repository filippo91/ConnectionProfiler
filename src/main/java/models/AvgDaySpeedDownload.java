package models;

import java.util.Calendar;
import java.util.Date;

public class AvgDaySpeedDownload {
	private Date timestamp;
	private int asnum;
	private int speed;
	private int count;
	
	public AvgDaySpeedDownload(int asnum, int speed, int count, Date timestamp){
		this.asnum = asnum;
		this.speed = speed;
		this.count = count;
		
		Calendar cal = Calendar.getInstance();
		cal.setTime(timestamp);
		cal.set(Calendar.HOUR, 0);
		cal.set(Calendar.MINUTE, 0);
		cal.set(Calendar.SECOND, 0);
		cal.set(Calendar.MILLISECOND, 0);
		this.timestamp = cal.getTime();
	}
	
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public int getAsnum() {
		return asnum;
	}

	public void setAsnum(int asnum) {
		this.asnum = asnum;
	}

	public int getSpeed() {
		return speed;
	}

	public void setSpeed(int speed) {
		this.speed = speed;
	}
	
	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

	@Override
	public String toString() {
		return "SpeedDownload [speed=" + speed + ", asnum=" + asnum + ", timestamp=" + timestamp +"]";
	}
}

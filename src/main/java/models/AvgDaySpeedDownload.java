package models;

import java.util.Calendar;
import java.util.Date;

public class AvgDaySpeedDownload {
	private Date timestamp;
	private Integer asnum;
	private Integer speed;
	private Integer count;
	
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

	public Integer getAsnum() {
		return asnum;
	}

	public void setAsnum(Integer asnum) {
		this.asnum = asnum;
	}

	public Integer getSpeed() {
		return speed;
	}

	public void setSpeed(Integer speed) {
		this.speed = speed;
	}

	public Integer getCount() {
		return count;
	}

	public void setCount(Integer count) {
		this.count = count;
	}

	
}

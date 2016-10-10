package models;

import java.util.Date;
import org.joda.time.DateTime;

public class AvgDaySpeedDownload {
	private Date timestamp;
	private Integer asnum;
	private Long speed;
	private Integer count;
	private String asname;
	
	public AvgDaySpeedDownload(int asnum, long speed, int count, Date timestamp){
		this.asnum = asnum;
		this.speed = speed;
		this.count = count;
		
		DateTime dateTime = new DateTime(timestamp);

		dateTime.withTimeAtStartOfDay();
		this.timestamp = dateTime.toDate();
	}
	
	
	
	public String getAsname() {
		return asname;
	}



	public void setAsname(String asname) {
		this.asname = asname;
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

	public Long getSpeed() {
		return speed;
	}

	public void setSpeed(Long speed) {
		this.speed = speed;
	}

	public Integer getCount() {
		return count;
	}

	public void setCount(Integer count) {
		this.count = count;
	}



	@Override
	public String toString() {
		return "AvgDaySpeedDownload [timestamp=" + timestamp + ", asnum=" + asnum + ", speed=" + speed + ", count="
				+ count + ", asname=" + asname + "]";
	}



	
}

package models;

public class BinSpeedDownload {
	private Integer asnum;
	private Integer bin;
	private Integer nRecords;
	private String asname;	
	
	public String getAsname() {
		return asname;
	}
	public void setAsname(String asname) {
		this.asname = asname;
	}
	public Integer getAsnum() {
		return asnum;
	}
	public void setAsnum(Integer asnum) {
		this.asnum = asnum;
	}
	public Integer getBin() {
		return bin;
	}
	public void setBin(Integer bin) {
		this.bin = bin;
	}
	public Integer getnRecords() {
		return nRecords;
	}
	public void setnRecords(Integer nRecords) {
		this.nRecords = nRecords;
	}
	@Override
	public String toString() {
		return "BinSpeedDownload [asnum=" + asnum + ", bin=" + bin + ", nRecords=" + nRecords + "]";
	}
	
	
	
}

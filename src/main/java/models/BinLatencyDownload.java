package models;

public class BinLatencyDownload {
	private Integer asnum;
	private Integer bin;
	private Integer nRecords;
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
		return "BinLatencyDownload [asnum=" + asnum + ", bin=" + bin + ", nRecords=" + nRecords + "]";
	}
	
	
}

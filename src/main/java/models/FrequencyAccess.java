package models;

public class FrequencyAccess {
	private Integer nRecords;
	private String server_domain;
	
	public Integer getnRecords() {
		return nRecords;
	}
	public void setnRecords(Integer nRecords) {
		this.nRecords = nRecords;
	}
	public String getServer_domain() {
		return server_domain;
	}
	public void setServer_domain(String server_domain) {
		this.server_domain = server_domain;
	}
	@Override
	public String toString() {
		return "FrequencyAccess [nRecords=" + nRecords + ", server_domain=" + server_domain + "]";
	}
	
	
}

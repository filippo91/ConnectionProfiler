package models;

import java.util.Collection;

public class TableDownload {
	private Collection<Download> downloads;
	private Long totalElements;
	
	public Long getTotalElements() {
		return totalElements;
	}
	public void setTotalElements(Long totalElements) {
		this.totalElements = totalElements;
	}
	public Collection<Download> getDownload() {
		return downloads;
	}
	public void setDownload(Collection<Download> download) {
		this.downloads = download;
	}
}

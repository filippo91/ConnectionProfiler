package models;

public class SizeDownload {
	private Long size;
	private String server_domain;
	
	public Long getSize() {
		return size;
	}
	public void setSize(Long size) {
		this.size = size;
	}
	public String getServer_domain() {
		return server_domain;
	}
	public void setServer_domain(String server_domain) {
		this.server_domain = server_domain;
	}
	@Override
	public String toString() {
		return "SizeDownload [size=" + size + ", server_domain=" + server_domain + "]";
	}
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((server_domain == null) ? 0 : server_domain.hashCode());
		result = prime * result + ((size == null) ? 0 : size.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (!(obj instanceof SizeDownload))
			return false;
		SizeDownload other = (SizeDownload) obj;
		if (server_domain == null) {
			if (other.server_domain != null)
				return false;
		} else if (!server_domain.equals(other.server_domain))
			return false;
		if (size == null) {
			if (other.size != null)
				return false;
		} else if (!size.equals(other.size))
			return false;
		return true;
	}
}

package models;

import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotBlank;
import org.hibernate.validator.constraints.Range;

public class ProviderPlan {
	@NotNull
	private Integer asnum;
	@NotBlank
	private String asname;	
	@Range(min=1,max=100)
	private Integer bandwidth;
	
	public Integer getAsnum() {
		return asnum;
	}

	public void setAsnum(Integer asnum) {
		this.asnum = asnum;
	}
	
	public String getAsname() {
		return asname;
	}

	public void setAsname(String asname) {
		this.asname = asname;
	}

	/**
	 * 
	 * @return bandwidth in Mbps
	 */
	public Integer getBandwidth() {
		return bandwidth;
	}

	public void setBandwidth(Integer bandwidth) {
		this.bandwidth = bandwidth;
	}
	
	
}

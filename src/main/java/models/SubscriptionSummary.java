package models;

import javax.validation.constraints.NotNull;

public class SubscriptionSummary {
	@NotNull
	private ProviderPlan providerPlan;
	@NotNull
	private Bandwidth bandwidth;
	
	public ProviderPlan getProviderPlan() {
		return providerPlan;
	}
	public void setProviderPlan(ProviderPlan providerPlan) {
		this.providerPlan = providerPlan;
	}
	public Bandwidth getBandwidth() {
		return bandwidth;
	}
	public void setBandwidth(Bandwidth bandwidth) {
		this.bandwidth = bandwidth;
	}
	
	
}

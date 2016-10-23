package models;

public class SubscriptionSummary {
	private ProviderPlan providerPlan;
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

package models;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.NotNull;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="USERS_SUBSCRIPTIONS")
public class UserSubscription {
	@Id
	@NotNull
	private BigInteger uid;
	
	@NotNull
	private List<ProviderPlan> providerPlans = new ArrayList<>();

	public BigInteger getUid() {
		return uid;
	}

	public void setUid(BigInteger uid) {
		this.uid = uid;
	}

	public List<ProviderPlan> getProviderPlans() {
		return providerPlans;
	}

	public void setProviderPlans(List<ProviderPlan> providerPlans) {
		this.providerPlans = providerPlans;
	}
}

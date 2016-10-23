package repositories;

import java.math.BigInteger;
import java.util.List;

import org.springframework.data.repository.NoRepositoryBean;

import models.ProviderPlan;

@NoRepositoryBean
public interface CustomUserSubscriptionRepository {
	void pushProviderPlan(BigInteger userId, ProviderPlan plan);
	ProviderPlan getProviderPlan(BigInteger userId, Integer asnum);
	List<ProviderPlan> getProviderPlans(BigInteger valueOf);
}

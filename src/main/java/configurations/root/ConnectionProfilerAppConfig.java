package configurations.root;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.apache.commons.dbcp.BasicDataSource;
import org.hibernate.jpa.HibernatePersistenceProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.Database;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import com.mongodb.Mongo;
import com.mongodb.MongoClient;

@Configuration
@ComponentScan(basePackages={"services", "configurations.security", "listeners"})
@EnableMongoRepositories(basePackages={"repositories"})
@EnableJpaRepositories(basePackages={"repositories"})
@EnableTransactionManagement
public class ConnectionProfilerAppConfig {
	//RootContext
	public @Bean Mongo mongo() throws Exception {
		return new MongoClient("localhost");
	}
	
	public @Bean MongoTemplate mongoTemplate() throws Exception{
		return new MongoTemplate(mongo(), "dbname");
	}
	
	public @Bean DataSource dataSource(){
		BasicDataSource dataSource = new BasicDataSource();
		dataSource.setDriverClassName("com.mysql.jdbc.Driver");
		dataSource.setUrl("jdbc:mysql://localhost/aiproject");
		dataSource.setUsername("root");
		dataSource.setPassword("");
		return dataSource;
	}
	
	
	  public @Bean EntityManagerFactory entityManagerFactory(DataSource dataSource) {

	    HibernateJpaVendorAdapter vendorAdapter = new HibernateJpaVendorAdapter();
	    vendorAdapter.setDatabase(Database.MYSQL);
	    vendorAdapter.setGenerateDdl(true);
	    
	    LocalContainerEntityManagerFactoryBean factory = new LocalContainerEntityManagerFactoryBean();
	    factory.setJpaVendorAdapter(vendorAdapter);
	    factory.setPackagesToScan("models");
	    factory.setDataSource(dataSource);
	    factory.setPersistenceProviderClass(HibernatePersistenceProvider.class);  
	    //factory.setJpaProperties(new);
	    factory.afterPropertiesSet();

	    return factory.getObject();
	  }


	  public @Bean PlatformTransactionManager transactionManager(EntityManagerFactory factory) {

	    JpaTransactionManager txManager = new JpaTransactionManager();
	    txManager.setEntityManagerFactory(factory);
	    return txManager;
	  }

}

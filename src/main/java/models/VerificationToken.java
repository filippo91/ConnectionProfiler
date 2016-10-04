package models;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;

import org.joda.time.DateTime;

@Entity(name="verificationToken")
public class VerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    
    
    private String token;
   
    @OneToOne(targetEntity = User.class)
    @JoinColumn(nullable = false, name = "username")
    private User user;
     
    private Date expiryDate;
    private boolean verified;
    
    public VerificationToken() {
        super();
    }
    
    public VerificationToken(String token, User user, int expiration) {
        super();
        this.token = token;
        this.user = user;
        this.expiryDate = calculateExpiryDate(expiration);
        this.verified = false;
    }
     
    private Date calculateExpiryDate(int expiryTimeInMinutes) {
    	DateTime now = DateTime.now();
    	DateTime expiryDate = now.plusMinutes(expiryTimeInMinutes);
    	
        return new Date(expiryDate.getMillis());
    }
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	public Date getExpiryDate() {
		return expiryDate;
	}
	public void setExpiryDate(Date expiryDate) {
		this.expiryDate = expiryDate;
	}
	public boolean isVerified() {
		return verified;
	}
	public void setVerified(boolean verified) {
		this.verified = verified;
	}
	
	public boolean isExpired(){
		DateTime now = DateTime.now();
		return now.isAfter(expiryDate.getTime());
	}

	@Override
	public String toString() {
		return "VerificationToken [id=" + id + ", token=" + token + ", user=" + user + ", expiryDate=" + expiryDate
				+ ", verified=" + verified + "]";
	}
	
	
}

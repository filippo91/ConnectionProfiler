package models;

import java.util.Date;

import javax.persistence.Column;
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
    
    @Column(unique=true)
    private String token;
   
    @OneToOne(targetEntity = User.class)
    @JoinColumn(nullable = false, name = "id")
    private User user;
     
    private Date creationDate;
	private Date expirationDate;
	
    private boolean verified;


    
    public VerificationToken() {
        super();
    }
    
    public VerificationToken(String token, User user, Date creationDate, Date expirationDate) {
        super();
        this.token = token;
        this.user = user;
        this.creationDate = creationDate;
        this.expirationDate = expirationDate;
        this.verified = false;
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

	
	public boolean isVerified() {
		return verified;
	}
	public void setVerified(boolean verified) {
		this.verified = verified;
	}
	
	public Date getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Date creationDate) {
		this.creationDate = creationDate;
	}

	public Date getExpirationDate() {
		return expirationDate;
	}

	public void setExpirationDate(Date expirationDate) {
		this.expirationDate = expirationDate;
	}

	public boolean isExpired(Date date) {
		DateTime verificationDate = new DateTime(date);
		return verificationDate.isAfter(expirationDate.getTime());
	}
	
	@Override
	public String toString() {
		return "VerificationToken [id=" + id + ", token=" + token + ", user=" + user + ", creationDate=" + creationDate
				+ ", expirationDate=" + expirationDate + ", verified=" + verified + "]";
	}
}

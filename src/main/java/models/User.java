package models;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.Email;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;


/**
 * This class represents a user of the system. 
 * Each user has the username/password pair and an email address.
 * The system will also automatically assign a unique user identifier.
 * 
 * @author philip
 *
 */
@Entity(name="users")
public class User implements UserDetails {
	/**
	 * 
	 */
	private static final long serialVersionUID = 5004792185908475274L;

	@Column(unique=true)
	@Size(min=3, max=20)
	private  String username;
	
	@Email
	@Column(unique=true)
	private String email;
	
	@JsonProperty(access = Access.WRITE_ONLY)
    private String password;

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
	private Integer uid;
	
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    
    private boolean enabled;
    
    private String role;
    
    @OneToMany(mappedBy="user", cascade=CascadeType.PERSIST)
    private Set<Subscription> subscriptions = new HashSet<>();
    
    public User() {
	}
    
	public User(String username, String email, String password) {
		super();
		this.username = username;
		this.email = email;
		this.password = password;
	}
    
	public User(String username, String email, String password, Integer id) {
		super();
		this.username = username;
		this.email = email;
		this.password = password;
		this.uid = id;
	}



	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}

	public Integer getUid() {
		return uid;
	}

	public void setUid(Integer id) {
		this.uid = id;
	}

	@JsonIgnore
	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public boolean isAccountNonExpired() {
		return accountNonExpired;
	}

	public void setAccountNonExpired(boolean accountNonExpired) {
		this.accountNonExpired = accountNonExpired;
	}

	public boolean isAccountNonLocked() {
		return accountNonLocked;
	}

	public void setAccountNonLocked(boolean accountNonLocked) {
		this.accountNonLocked = accountNonLocked;
	}

	public boolean isCredentialsNonExpired() {
		return credentialsNonExpired;
	}

	public void setCredentialsNonExpired(boolean credentialsNonExpired) {
		this.credentialsNonExpired = credentialsNonExpired;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}
	
	public void setEmail(String email){
		this.email = email;
	}
	
	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public String getEmail() {
		return email;
	}
	
	public Collection<? extends GrantedAuthority> getAuthorities() {		
        List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
        
        authorities.add(new SimpleGrantedAuthority(role));
        
        return authorities;
	}
	
	public Set<Subscription> getSubscriptions() {
		return subscriptions;
	}

	public void setSubscriptions(Set<Subscription> subscriptions) {
		this.subscriptions = subscriptions;
	}

	public void addSubscription(Subscription s){
		this.subscriptions.add(s);
	}
	
	@Override
	public String toString() {
		return "User [username=" + username + ", email=" + email + ", id=" + uid + ", accountNonExpired="
				+ accountNonExpired + ", accountNonLocked=" + accountNonLocked + ", credentialsNonExpired="
				+ credentialsNonExpired + ", enabled=" + enabled + ", role=" + role + "]";
	}
	
	
}
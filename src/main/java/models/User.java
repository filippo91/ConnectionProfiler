package models;

import java.util.HashSet;
import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.Email;


/**
 * This class represents a user of the system. 
 * Each user has the username/password pair and an email address.
 * The system will also automatically assign a unique user identifier.
 * 
 * @author philip
 *
 */
@Entity(name="users")
public class User {
	@Id
	@Size(min=3, max=10)
	private  String username;
	
	@Email
	private String email;
	
	@Size(min=3, max=10)
    private String password;

	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer id;
	
    private boolean accountNonExpired;
    private boolean accountNonLocked;
    private boolean credentialsNonExpired;
    
    private boolean enabled;
    
	@ManyToMany
	@JoinTable(
			name="user_authority",
			inverseJoinColumns=@JoinColumn(name="authorities", referencedColumnName="authority"),
			joinColumns=@JoinColumn(name="users", referencedColumnName="username"))
    private Set<Authority> roles = new HashSet<Authority>();
    
    public User() {
	}
    
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

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

	public Set<Authority> getRoles() {
		return roles;
	}

	public void setRoles(Set<Authority> roles) {
		this.roles = roles;
	}

	public void setEmail(String email){
		this.email = email;
	}
	
	public String getEmail() {
		return email;
	}
}
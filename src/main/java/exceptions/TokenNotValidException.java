package exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value=HttpStatus.NOT_ACCEPTABLE, 
reason="Verification Token is invalid")
public class TokenNotValidException extends RuntimeException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 2176575252368590723L;

}

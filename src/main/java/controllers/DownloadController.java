
package controllers;

import java.util.HashSet;
import java.util.Set;

import javax.validation.ConstraintViolation;
import javax.validation.Valid;
import javax.validation.Validation;
import javax.validation.Validator;
import javax.validation.ValidatorFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import models.Download;
import models.User;
import services.DownloadService;

@CrossOrigin
@RestController
public class DownloadController {
	private static final Logger log = LoggerFactory.getLogger(DownloadController.class);
	
	@Autowired private SimpMessagingTemplate messagingTemplate;
	
	@Autowired private DownloadService downloadService;
	
	@PostMapping(path="/download")
	@ResponseStatus(value=HttpStatus.CREATED)	
	public Download saveDownload(
			@RequestBody @Valid Download download,
			@AuthenticationPrincipal User user)
	{
		log.info(download.toString());
		/*
		 * security concerns: downloadService.setUuid(download);
		 * make sure the authenticated user is uploading the download
		 * without messing with the record
		 */
		download.setUuid(user.getUid());
		
		Download downloadCreated = downloadService.saveDownload(download);
	
		messagingTemplate.convertAndSend("/topic/downloads", new GenericMessage<Download>(downloadCreated));
		messagingTemplate.convertAndSendToUser(user.getUsername(), "/downloads", new GenericMessage<Download>(downloadCreated));
		
		return downloadCreated;
	}
	
	@PostMapping(path="/downloads")
	@ResponseStatus(value=HttpStatus.CREATED)	
	public void saveDownload(
			@RequestBody Set<Download> downloads,
			@AuthenticationPrincipal User user)
	{
		log.info(downloads.toString());
		
		ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
		Validator validator = factory.getValidator();
		Set<Download> validDownloads = new HashSet<>();
		
		for(Download download : downloads){
			Set<ConstraintViolation<Download>> constraintViolations = validator.validate(download);
			
			if(constraintViolations.size() > 0){
				continue;
			}
			
			validDownloads.add(download);
			/*
			 * security concerns: downloadService.setUuid(download);
			 * make sure the authenticated user is uploading the download
			 * without messing with the record
			 */
			download.setUuid(user.getUid());
			downloadService.saveDownload(download);
		}
		
		if(validDownloads.size() == 0){
			/*
			 * No valid downloads in the set
			 */
			throw new IllegalArgumentException();
		}
		
		messagingTemplate.convertAndSend("/topic/downloads", new GenericMessage<Set<Download>>(validDownloads));
		messagingTemplate.convertAndSendToUser(user.getUsername(), "/downloads", new GenericMessage<Set<Download>>(validDownloads));
		
		return;
	}
	
	
}

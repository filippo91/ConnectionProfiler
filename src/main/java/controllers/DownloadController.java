
package controllers;

import java.util.Collection;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import models.AvgDaySpeedDownload;
import models.BinLatencyDownload;
import models.BinSpeedDownload;
import models.Download;
import models.FrequencyAccess;
import models.SizeDownload;
import models.User;
import services.DownloadService;
import services.DownloadService.View;
import services.UserService;

@CrossOrigin
@RestController
public class DownloadController {
	private static final Logger log = LoggerFactory.getLogger(DownloadController.class);
	
	@Autowired private SimpMessagingTemplate messagingTemplate;
	private static final int ONE_MBIT = 1000000;
	
	@Autowired private DownloadService downloadService;
	@Autowired private UserService userService;
	
	/*
	 * @RequestMapping(method=GET) = @GetMapping
	 */
	@GetMapping("/speedGraph/{year}/{month}/{day}/{view}")
	public Collection<AvgDaySpeedDownload> getDownloadsSpeed(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){

		DateTime d = new DateTime(year, month+1, day, 0, 0);
		
		User user = userService.getCurrentUser();
		int uuid = user.getId();
		
		return downloadService.getAvgDayDownloadsSpeed(uuid, year, month, day, view);
	}
	
	@GetMapping("/publicSpeedGraph/{year}/{month}/{day}/{view}")
	public Collection<AvgDaySpeedDownload> getPublicDownloadsSpeed(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		
		return downloadService.getAvgDayDownloadsSpeed(year, month, day, view);
	}
	
	@GetMapping("/speedTable/{page}/{size}")
	public Collection<Download> getDownloadsSpeedByWeek(
			@PathVariable int page, 
			@PathVariable int size){
		User user = userService.getCurrentUser();
		int uuid = user.getId();
		
		return downloadService.getDownloadsSpeed(uuid, page, size);
	}
	
	@GetMapping("/speedHistogram/{year}/{month}/{day}/{view}/{width}")
	public Collection<BinSpeedDownload> getBinSpeedDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@PathVariable int width){
		User user = userService.getCurrentUser();
		int uuid = user.getId();
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		width *= ONE_MBIT;
		
		return downloadService.getBinSpeedDownloads(uuid, year, month, day, view, width);
	}
	
	@GetMapping("/publicSpeedHistogram/{year}/{month}/{day}/{view}/{width}")
	public Collection<BinSpeedDownload> getPublicBinSpeedDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@PathVariable int width){
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		width *= ONE_MBIT;
		
		return downloadService.getBinSpeedDownloads(year, month, day, view, width);
	}
	
	@GetMapping("/latencyHistogram/{year}/{month}/{day}/{view}/{bin_width}")
	public Collection<BinLatencyDownload> getBinLatencyDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@PathVariable int bin_width){
		User user = userService.getCurrentUser();
		int uuid = user.getId();
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		return downloadService.getBinLatencyDownloads(uuid, year, month, day, view, bin_width);
	}
	
	@GetMapping("/pieAccesses/{year}/{month}/{day}/{view}")
	public Collection<FrequencyAccess> getDomainFrequencyAccess(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		User user = userService.getCurrentUser();
		int uuid = user.getId();
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		return downloadService.getDomainFrequencyAccess(uuid, year, month, day, view);
	}
	
	@GetMapping("/pieSize/{year}/{month}/{day}/{view}")
	public Collection<SizeDownload> getDomainSizeDownload(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view){
		User user = userService.getCurrentUser();
		int uuid = user.getId();
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		log.debug("getDomainSizeDownload for " + uuid);
		return downloadService.getDomainSizeDownload(uuid, year, month, day, view);
	}
	
	
	@PostMapping(path="/download")
	@ResponseStatus(value=HttpStatus.CREATED)	
	public Download saveDownload(@RequestBody Download download)
	{
		/*
		 * security concerns: downloadService.setUuid(download);
		 * make sure the authenticated user is uploading the download
		 * without messing with the record
		 */
		User user = userService.getCurrentUser();
		download.setUuid(user.getId());
		
		Download downloadCreated = downloadService.saveDownload(download);
	
		messagingTemplate.convertAndSend("/topic/downloads", new GenericMessage<Download>(downloadCreated));
		messagingTemplate.convertAndSendToUser(user.getUsername(), "/downloads", new GenericMessage<Download>(downloadCreated));
		
		return downloadCreated;
	}
	
	@ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "TODO") // 409
	@ExceptionHandler(IllegalArgumentException.class)
	public void duplicateInformationForNewUser() {
		// Nothing to do
	}
}

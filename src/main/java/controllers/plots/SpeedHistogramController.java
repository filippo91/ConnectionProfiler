package controllers.plots;

import java.util.Collection;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import models.BinSpeedDownload;
import models.User;
import services.PlotsService;
import services.PlotsService.View;

@RestController
@CrossOrigin
public class SpeedHistogramController {
	private static final Logger log = LoggerFactory.getLogger(SpeedHistogramController.class);
	private static final int ONE_MBIT = 1000000;
	
	@Autowired PlotsService plotsService;
	
	@GetMapping("/speedHistogram/{year}/{month}/{day}/{view}/{width}")
	public Collection<BinSpeedDownload> getBinSpeedDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@PathVariable int width,
			@AuthenticationPrincipal User user){
		
		log.info("try to get bin speed downloads: " + year + month + day + view + user);
		int uuid = user.getId();
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		width *= ONE_MBIT;
		log.info("after date is converted");
		return plotsService.getBinSpeedDownloads(uuid, year, month, day, view, width);
	}
	
	@PreAuthorize("permitAll()")
	@GetMapping("/publics/speedHistogram/{year}/{month}/{day}/{view}/{width}")
	public Collection<BinSpeedDownload> getPublicBinSpeedDownloads(
			@PathVariable int year, 
			@PathVariable int month, 
			@PathVariable int day,
			@PathVariable View view,
			@PathVariable int width){
		DateTime d = new DateTime(year, month+1, day, 0, 0);
		width *= ONE_MBIT;
		
		return plotsService.getBinSpeedDownloads(year, month, day, view, width);
	}
}

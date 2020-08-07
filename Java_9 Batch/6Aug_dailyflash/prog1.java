class DigitCount {
	static  int  num = 12345,count = 0;

	public static void  main(String[] args) {
	
		for(;num>0;) {
			num =  num / 10;
			count++;
		}
		System.out.println(count);
	}//main

}//class

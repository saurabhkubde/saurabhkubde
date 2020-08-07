class Avg {
	static  int  num = 1000;

	public static void  main(String[] args) {
	int count = 0,sum = 0,dig;
		for(int num = 12345678;num > 0;num = num / 10) {

			dig = num % 10;
			sum = sum + dig;
			count++;
		}//for
		System.out.println(sum/count);
		
	}//main

}//class

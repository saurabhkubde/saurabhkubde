class DigitCount {
	static  int  num = 12345;

	public static void  main(String[] args) {
	int sum = 0,mul = 1,dig;
		for(;num>0;) {

			dig  =  num % 10;
			if(dig % 2 == 0)
				sum = sum + dig;
			else
				mul = mul * dig;

			num = num / 10;
		}
		System.out.println("addition of even numbers:"+sum);
		System.out.println("multiplication of odd numbers:"+mul);
	}//main

}//class

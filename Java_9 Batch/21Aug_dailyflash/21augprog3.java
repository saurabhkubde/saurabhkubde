import java.io.*;

class unitprice {
	public static void main(String[] args) throws IOException {
		InputStreamReader isr = new InputStreamReader(System.in);
		BufferedReader br = new BufferedReader(isr); 

		int age = Integer.parseInt(br.readLine());
		char sex = (char)br.read();
		//char ms  = Char.parseChar(br.readLine());

		if(sex == 'F') {
			System.out.print("Work in Urban Area");
		
		}else if(sex == 'M' && age > 20 && age <= 40){
			System.out.print("Work in Anywhere");
			
		}else if(sex == 'M' && age > 40 && age < 60){
		      System.out.print("Work in Urban Area");
		}else{
			System.out.print("Error");
		}


		}

}	
		

